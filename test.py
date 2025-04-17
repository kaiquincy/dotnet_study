from flask import Flask, request, redirect, url_for
import os
import uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Cấu hình thư mục lưu file upload
UPLOAD_FOLDER = os.path.join(os.getcwd(), "images")
if not os.path.isdir(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Cho phép các định dạng file ảnh (có thể điều chỉnh tùy ý)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        # Kiểm tra xem có file nào được gửi lên không
        if 'file' not in request.files:
            return "Không tìm thấy file trong request."
        file = request.files['file']
        # Nếu người dùng không chọn file
        if file.filename == "":
            return "Chưa chọn file nào."
        # Kiểm tra định dạng file có hợp lệ hay không
        if file and allowed_file(file.filename):
            # Lấy phần mở rộng của file
            ext = file.filename.rsplit('.', 1)[1].lower()
            # Tạo tên file độc nhất
            unique_filename = f"{uuid.uuid4()}.{ext}"
            # Đảm bảo tên file an toàn
            unique_filename = secure_filename(unique_filename)
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
            file.save(file_path)
            return f"File đã được upload thành công: {file_path}"
        else:
            return "File không hợp lệ. Chỉ cho phép file ảnh với định dạng: png, jpg, jpeg, gif."
    
    # Nếu method GET, trả về form upload
    return '''
    <!doctype html>
    <html>
      <head>
        <title>Upload File</title>
      </head>
      <body>
        <h1>Upload File</h1>
        <form method="post" enctype="multipart/form-data">
          <input type="file" name="file">
          <input type="submit" value="Upload">
        </form>
      </body>
    </html>
    '''

if __name__ == "__main__":
    app.run(debug=True)
