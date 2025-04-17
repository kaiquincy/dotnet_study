import os
import json
import datetime
import uuid
import hashlib
from flask import Flask, request, jsonify, g, abort, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from flask_cors import CORS


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['UPLOAD_FOLDER'] = 'static'  # Thư mục lưu ảnh
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# -------------------------------------------
# Hàm tạo Order ID dài
# -------------------------------------------
def generate_order_id():
    # Kết hợp 2 UUID4 dạng hex tạo ra một chuỗi 64 ký tự
    return uuid.uuid4().hex + uuid.uuid4().hex

# -------------------------------------------
# Model Định Nghĩa các Bảng: User, Image, Order, OrderDetail, Payment, OrderStatus
# -------------------------------------------
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(120))
    full_name = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Image(db.Model):
    __tablename__ = 'images'
    image_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    file_path = db.Column(db.String(256))
    upload_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    description = db.Column(db.String(256), nullable=True)

class Order(db.Model):
    __tablename__ = 'orders'
    # Sử dụng String 64 ký tự với hàm tạo order id
    order_id = db.Column(db.String(64), primary_key=True, default=generate_order_id)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    total_amount = db.Column(db.Float, default=0)
    order_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    payment_status = db.Column(db.String(50), default="chưa thanh toán")
    order_note = db.Column(db.String(256), nullable=True)
    user = db.relationship("User", backref="orders")

class OrderDetail(db.Model):
    __tablename__ = 'order_details'
    order_detail_id = db.Column(db.Integer, primary_key=True)
    # Cập nhật kiểu cho order_id
    order_id = db.Column(db.String(64), db.ForeignKey('orders.order_id'))
    image_id = db.Column(db.Integer, db.ForeignKey('images.image_id'))
    size = db.Column(db.String(20))
    quantity = db.Column(db.Integer)
    unit_price = db.Column(db.Float)
    sub_total = db.Column(db.Float)
    order = db.relationship("Order", backref="order_details")
    image = db.relationship("Image")

class Payment(db.Model):
    __tablename__ = 'payments'
    payment_id = db.Column(db.Integer, primary_key=True)
    # Cập nhật kiểu cho order_id
    order_id = db.Column(db.String(64), db.ForeignKey('orders.order_id'))
    payment_method = db.Column(db.String(50))
    amount = db.Column(db.Float)
    payment_date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    payment_status = db.Column(db.String(50))
    order = db.relationship("Order", backref="payment")

class OrderStatus(db.Model):
    __tablename__ = 'order_status'
    order_status_id = db.Column(db.Integer, primary_key=True)
    # Cập nhật kiểu cho order_id
    order_id = db.Column(db.String(64), db.ForeignKey('orders.order_id'))
    isApproved = db.Column(db.Boolean, default=False)
    isShipping = db.Column(db.Boolean, default=False)
    isDelivered = db.Column(db.Boolean, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    order = db.relationship("Order", backref=db.backref("order_status", uselist=False))


def update_order_status(order_id, isApproved=None, isShipping=None, isDelivered=None, admin_id=None):
    try:
        # Tìm trạng thái hiện tại
        order_status = OrderStatus.query.filter_by(order_id=order_id).first()

        if not order_status:
            return jsonify({'message': 'Order not found or has no status record'}), 404

        # Cập nhật các giá trị nếu được truyền vào
        if isApproved is not None:
            order_status.isApproved = isApproved
        if isShipping is not None:
            order_status.isShipping = isShipping
        if isDelivered is not None:
            order_status.isDelivered = isDelivered
        if admin_id is not None:
            order_status.admin_id = admin_id

        db.session.commit()

        return jsonify({'message': 'Order status updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# -------------------------------------------
# Hàm Băm Mật Khẩu và Sinh Token
# -------------------------------------------
def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

auth_tokens = {}
def generate_token():
    return str(uuid.uuid4())

# -------------------------------------------
# Decorator Xác Thực: Sử dụng Bearer Token từ header "Authorization"
# -------------------------------------------
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"message": "Token không hợp lệ hoặc thiếu."}), 401
        token = auth_header.split("Bearer ")[1]
        if token not in auth_tokens:
            return jsonify({"message": "Token không hợp lệ hoặc đã hết hạn."}), 401
        g.current_user = auth_tokens[token]
        return f(*args, **kwargs)
    return decorated


# -------------------------------------------
# API: Đăng nhập (để nhận Bearer Token)
# -------------------------------------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Thiếu username hoặc password"}), 400

    username = data['username']
    password = data['password']
    hashed = hash_password(password)
    user = User.query.filter_by(username=username, password=hashed).first()
    if not user:
        return jsonify({"message": "Thông tin đăng nhập không đúng"}), 401

    token = generate_token()
    auth_tokens[token] = user
    return jsonify({"message": "Đăng nhập thành công", "access_token": token, "is_admin": user.is_admin})

# -------------------------------------------
# API: Tạo đơn hàng kết hợp upload nhiều ảnh với metadata riêng cho mỗi ảnh
# -------------------------------------------
@app.route('/orders', methods=['POST'])
@login_required
def create_order():
    user = g.current_user

    # Lấy dữ liệu từ form: order_note và order_items (chuỗi JSON)
    order_note = request.form.get('order_note', '')
    order_items_str = request.form.get('order_items', '[]')

    try:
        order_items = json.loads(order_items_str)
    except json.JSONDecodeError:
        return jsonify({"message": "order_items không đúng định dạng JSON"}), 400

    if not order_items:
        return jsonify({"message": "Không có mục đơn hàng nào được gửi đi"}), 400

    # Tạo đơn hàng mới (order_id được tạo tự động với định dạng chuỗi dài nếu bạn đã cập nhật model)
    new_order = Order(user_id=user.user_id, order_note=order_note)
    db.session.add(new_order)
    db.session.flush()  # Lấy new_order.order_id

    total_amount = 0

    # Xử lý từng mục trong order_items: mỗi mục cần có file_field, size, quantity, unit_price
    for index, item in enumerate(order_items):
        missing_fields = []
        for field in ['file_field', 'size', 'quantity', 'unit_price']:
            if field not in item or item[field] in [None, '']:
                missing_fields.append(field)
        if missing_fields:
            return jsonify({
                "message": f"Mục đơn hàng thứ {index+1} bị thiếu các field: {', '.join(missing_fields)}"
            }), 400

        file_field = item.get('file_field')
        size = item.get('size')
        quantity = item.get('quantity')
        unit_price = item.get('unit_price')

        # Lấy file tương ứng từ request.files
        if file_field not in request.files:
            return jsonify({"message": f"Không tìm thấy file với key {file_field}"}), 400

        file = request.files[file_field]
        if file.filename == '':
            return jsonify({"message": f"Tên file rỗng cho key {file_field}"}), 400

        # Lưu file tạm thời với tên ban đầu
        original_filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], original_filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(temp_path)

        # Tạo bản ghi Image cho file vừa upload
        new_image = Image(
            user_id=user.user_id,
            file_path=temp_path,  # ban đầu lưu đường dẫn tạm thời
            upload_date=datetime.datetime.utcnow(),
            description=f"Ảnh cho order item với key {file_field}"
        )
        db.session.add(new_image)
        db.session.flush()  # Lấy new_image.image_id

        # Đổi tên file để trùng với image_id
        # Lấy phần mở rộng của file (vd: .jpg, .png)
        # _, ext = os.path.splitext(original_filename)
        ext = ".png"
        # Tạo tên file mới theo image_id
        new_filename = f"{new_image.image_id}{ext}"
        new_file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        # Đổi tên file trên hệ thống
        os.rename(temp_path, new_file_path)
        # Cập nhật lại file_path trong bản ghi Image
        new_image.file_path = new_filename

        # Tạo bản ghi OrderDetail
        sub_total = quantity * unit_price
        total_amount += sub_total
        order_detail = OrderDetail(
            order_id=new_order.order_id,
            image_id=new_image.image_id,
            size=size,
            quantity=quantity,
            unit_price=unit_price,
            sub_total=sub_total
        )
        db.session.add(order_detail)

    new_order.total_amount = total_amount

    # Tạo trạng thái đơn hàng mặc định
    order_status = OrderStatus(order_id=new_order.order_id)
    db.session.add(order_status)

    db.session.commit()
    return jsonify({"message": "Đơn hàng được tạo thành công", "order_id": new_order.order_id, "total_amount": new_order.total_amount})



@app.route('/orders', methods=['GET'])
@login_required
def get_my_orders():
    # g.current_user được set bởi decorator login_required
    user = g.current_user

    # Lấy tất cả đơn hàng của user này
    orders = Order.query.filter_by(user_id=user.user_id).all()
    result = []
    for order in orders:
        # Lấy status (one‑to‑one relationship)
        status = order.order_status
        # Tính trạng thái tổng quát
        if status and status.isApproved:
            if status.isDelivered:
                computed_status = 'delivered'
            elif status.isShipping:
                computed_status = 'shipping'
            else:
                computed_status = 'processed'
        else:
            computed_status = 'pending'

        # Xây dựng chi tiết các mục trong đơn
        details = []
        for d in order.order_details:
            details.append({
                "order_detail_id":  d.order_detail_id,
                "image_id":         d.image_id,
                "size":             d.size,
                "quantity":         d.quantity,
                "unit_price":       d.unit_price,
                "sub_total":        d.sub_total,
                # nếu bạn lưu filename theo image_id, backend có thể trả thêm:
                "image_file":       f"{d.image_id}.png"
            })

        result.append({
            "order_id":       order.order_id,
            "order_date":     order.order_date.strftime("%Y-%m-%d %H:%M:%S"),
            "total_amount":   order.total_amount,
            "payment_status": order.payment_status,
            "order_note":     order.order_note,
            "status":         computed_status,
            "order_details":  details
        })

    return jsonify({ "orders": result })




@app.route('/orders/<order_id>', methods=['GET'])
@login_required
def get_order(order_id):
    user = g.current_user
    order = Order.query.filter_by(order_id=order_id).first()
    if not order:
        return jsonify({"message": "Không tìm thấy đơn hàng."}), 404

    # Kiểm tra quyền truy cập: chỉ chủ đơn hàng hoặc admin mới được xem
    if order.user_id != user.user_id and not user.is_admin:
        return jsonify({"message": "Không có quyền truy cập đơn hàng này."}), 403

    # Xây dựng danh sách chi tiết các mục đơn hàng
    order_details = []
    for detail in order.order_details:
        order_details.append({
            "order_detail_id": detail.order_detail_id,
            "image_id": detail.image_id,
            "size": detail.size,
            "quantity": detail.quantity,
            "unit_price": detail.unit_price,
            "sub_total": detail.sub_total
        })

    # Nếu có thông tin thanh toán hoặc trạng thái, bạn có thể bổ sung thêm
    payment_info = None
    if order.payment:
        payment_info = {
            "payment_id": order.payment.payment_id,
            "payment_method": order.payment.payment_method,
            "amount": order.payment.amount,
            "payment_date": order.payment.payment_date.strftime("%Y-%m-%d %H:%M:%S"),
            "payment_status": order.payment.payment_status
        }

    order_status = None
    if order.order_status:
        order_status = {
            "isApproved": order.order_status.isApproved,
            "isShipping": order.order_status.isShipping,
            "isDelivered": order.order_status.isDelivered,
            "updated_at": order.order_status.updated_at.strftime("%Y-%m-%d %H:%M:%S"),
            "admin_id": order.order_status.admin_id
        }

    response = {
        "order_id": order.order_id,
        "user_id": order.user_id,
        "total_amount": order.total_amount,
        "order_date": order.order_date.strftime("%Y-%m-%d %H:%M:%S"),
        "payment_status": order.payment_status,
        "order_note": order.order_note,
        "order_details": order_details,
        "payment_info": payment_info,
        "order_status": order_status
    }
    return jsonify(response)


# Endpoint trả về đơn hàng pending (chỉ admin có quyền)
@app.route('/admin/orders', methods=['GET'])
@login_required
def get_pending_orders():
    if not g.current_user.is_admin:
        return jsonify({"message": "Unauthorized"}), 403

    pending_orders = []
    # Lấy tất cả các đơn hàng, sau đó tính trạng thái và lọc lấy trạng thái pending.
    orders = Order.query.all()  
    for order in orders:
        status_obj = order.order_status  # Với uselist=False, đây là một đối tượng
        # Tính trạng thái dựa trên các trường của OrderStatus
        if status_obj:
            if not status_obj.isApproved:
                computed_status = 'pending'
            elif not status_obj.isShipping:
                computed_status = 'processed'
            elif not status_obj.isDelivered:
                computed_status = 'shipping'
            else:
                computed_status = 'delivered'
        else:
            computed_status = 'pending'
        if computed_status == 'pending':
            pending_orders.append({
                "order_id": order.order_id,
                "userEmail": order.user.email if order.user else "N/A",
                "total": order.total_amount,
                "paymentMethod": order.payment.payment_method if order.payment else "N/A"
            })

    return jsonify({"orders": pending_orders})

# Endpoint cập nhật trạng thái đơn hàng (đánh dấu là processed)
@app.route('/admin/orders/<order_id>/process', methods=['POST'])
@login_required
def process_order(order_id):
    if not g.current_user.is_admin:
        return jsonify({"message": "Unauthorized"}), 403

    order = Order.query.filter_by(order_id=order_id).first()
    if not order or not order.order_status:
        return jsonify({"message": "Order not found or missing status"}), 404

    # Giả sử "process" đơn hàng có nghĩa là cập nhật:
    # isApproved = True (đã duyệt), nhưng vẫn chưa chuyển sang isShipping hoặc isDelivered.
    order.order_status.isApproved = True
    db.session.commit()
    return jsonify({"message": "Order marked as processed", "order_id": order.order_id})



# -------------------------------------------
# API: Đăng ký (Register)
# -------------------------------------------
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['username', 'password', 'email', 'full_name', 'phone']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"message": f"Thiếu trường {field}"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "Username đã tồn tại"}), 400

    new_user = User(
        username=data['username'],
        password=hash_password(data['password']),
        email=data['email'],
        full_name=data['full_name'],
        phone=data['phone']
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Đăng ký thành công!"}), 201

# -------------------------------------------
# Khởi tạo cơ sở dữ liệu và tạo tài khoản mẫu
# -------------------------------------------
def setup_db():
    db.create_all()
    if not User.query.first():
        customer = User(
            username='customer1',
            password=hash_password('password123'),
            email='customer@example.com',
            full_name='Khách Hàng',
            phone='0123456789',
            is_admin=False
        )
        admin = User(
            username='admin1',
            password=hash_password('adminpass'),
            email='admin@example.com',
            full_name='Administrator',
            phone='0987654321',
            is_admin=True
        )
        db.session.add(customer)
        db.session.add(admin)
        db.session.commit()

if __name__ == '__main__':
    CORS(app)
    with app.app_context():
        setup_db()
    app.run(debug=True)
