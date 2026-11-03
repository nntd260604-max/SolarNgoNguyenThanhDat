# Script chup toan bo man hinh he thong Hoang Giang Solar
# Sinh vien: Ngo Nguyen Thanh Dat (MSSV: 2224801030332 - Lop: D22KTPM03)

$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "d:\F_ACER_NITRO_V\CODE_visual\website dat\assets\screenshots"
if (!(Test-Path $outDir)) {
  New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$shots = @(
  @{
    Name = "Hinh4_01_Trang_chu_toan_canh.png"
    Url = "http://localhost:3000/home.html"
    Width = 1440
    Height = 1000
    Desc = "Trang chu Hoang Giang Solar toan canh"
  }
  @{
    Name = "Hinh4_02_Cong_cu_Solar_ROI.png"
    Url = "http://localhost:3000/home.html#calculator"
    Width = 1440
    Height = 1200
    Desc = "Cong cu du toan Solar ROI va thoi gian hoan von"
  }
  @{
    Name = "Hinh4_03_Tra_cuu_bao_hanh_Serial.png"
    Url = "http://localhost:3000/home.html#warranty-check"
    Width = 1440
    Height = 1100
    Desc = "Tinh nang tra cuu bao hanh thiet bi theo so Serial"
  }
  @{
    Name = "Hinh4_04_Thu_vien_ma_loi_Inverter.png"
    Url = "http://localhost:3000/home.html#knowledge-base"
    Width = 1440
    Height = 1100
    Desc = "Thu vien tra cuu ma loi Inverter Solis va Deye"
  }
  @{
    Name = "Hinh4_05_Form_tu_van_nhanh.png"
    Url = "http://localhost:3000/home.html#contact-form"
    Width = 1440
    Height = 1000
    Desc = "Bieu mau tiep nhan tu van khao sat nhanh"
  }
  @{
    Name = "Hinh4_06_Man_hinh_dang_nhap_1click.png"
    Url = "http://localhost:3000/login.html"
    Width = 1440
    Height = 900
    Desc = "Man hinh dang nhap phan quyen RBAC va nut 1-click test"
  }
  @{
    Name = "Hinh4_07_Cong_dich_vu_khach_hang.png"
    Url = "http://localhost:3000/index.html"
    Width = 1440
    Height = 950
    Desc = "Cong dich vu khach hang gui yeu cau va theo doi"
  }
  @{
    Name = "Hinh4_08_Dashboard_Admin_KPI.png"
    Url = "http://localhost:3000/admin.html"
    Width = 1440
    Height = 1000
    Desc = "Bang dieu khien quan tri KPI va bieu do Chart.js"
  }
  @{
    Name = "Hinh4_09_Admin_quan_ly_yeu_cau.png"
    Url = "http://localhost:3000/admin.html"
    Width = 1440
    Height = 1100
    Desc = "Bang quan ly phieu yeu cau va bo loc da tieu chi"
  }
  @{
    Name = "Hinh4_10_Admin_thiet_bi_lap_dat.png"
    Url = "http://localhost:3000/admin.html"
    Width = 1440
    Height = 1100
    Desc = "Quan ly thiet bi da lap dat va thoi han bao hanh"
  }
  @{
    Name = "Hinh4_11_Admin_thu_vien_ma_loi.png"
    Url = "http://localhost:3000/admin.html"
    Width = 1440
    Height = 1100
    Desc = "Quan ly danh muc ma loi Inverter va Camera"
  }
  @{
    Name = "Hinh4_12_Tai_lieu_API_Swagger_Docs.png"
    Url = "http://localhost:3000/api/docs"
    Width = 1440
    Height = 1200
    Desc = "Tai lieu API tuong tac Swagger Documentation"
  }
  @{
    Name = "Hinh4_13_Giao_dien_Mobile_Responsive.png"
    Url = "http://localhost:3000/home.html"
    Width = 414
    Height = 896
    Desc = "Giao dien co gian hien thi tren dien thoai di dong"
  }
)

Write-Host "Bat dau chup $($shots.Count) man hinh..."
$count = 0
foreach ($s in $shots) {
  $count++
  $target = Join-Path $outDir $s.Name
  Write-Host "[$count/$($shots.Count)] Dang chup: $($s.Desc) -> $($s.Name)..."
  $w = $s.Width
  $h = $s.Height
  $u = $s.Url
  
  $proc = Start-Process -FilePath $edgePath -ArgumentList "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=$w,$h", "--screenshot=""$target""", "$u" -PassThru -Wait
  if (Test-Path $target) {
    $size = (Get-Item $target).Length
    Write-Host "   -> Thanh cong! Kich thuoc: $([math]::Round($size/1024, 1)) KB"
  } else {
    Write-Host "   -> Khong the luu anh: $target"
  }
}

Write-Host "`nDA HOAN TAT CHUP TOAN BO MAN HINH! Thu muc: $outDir"
