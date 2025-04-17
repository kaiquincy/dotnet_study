using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PhotoOrderApi.Data;
using PhotoOrderApi.DTOs;
using PhotoOrderApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PhotoOrderApi.Controllers
{
    [ApiController]
    [Route("")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        private readonly IConfiguration _cfg;

        public AuthController(AppDbContext ctx, IConfiguration cfg)
        {
            _ctx = ctx;
            _cfg = cfg;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            if (_ctx.Users.Any(u => u.Username == dto.Username))
                return BadRequest("Username đã tồn tại");

            var user = new User
            {
                Username = dto.Username,
                PasswordHash = Hash(dto.Password),
                Email = dto.Email,
                FullName = dto.FullName,
                Phone = dto.Phone
            };
            _ctx.Users.Add(user);
            _ctx.SaveChanges();
            return Created("", new { message = "Đăng ký thành công!" });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var hash = Hash(dto.Password!);
            var user = _ctx.Users.FirstOrDefault(u => u.Username == dto.Username && u.PasswordHash == hash);
            if (user == null) return Unauthorized("Thông tin không đúng");

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_cfg["Jwt:Key"]!);
            var tokenDesc = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim("isAdmin", user.IsAdmin.ToString())
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDesc);
            return Ok(new { access_token = tokenHandler.WriteToken(token), isAdmin = user.IsAdmin });
        }

        private static string Hash(string pwd)
        {
            using var sha = System.Security.Cryptography.SHA256.Create();
            return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(pwd)));
        }
    }
}