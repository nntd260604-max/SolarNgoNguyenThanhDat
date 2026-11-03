@echo off
chcp 65001 >nul
echo =========================================================================
echo   DONG BO MA NGUON HOANG GIANG SOLAR LEN GITHUB
echo   Sinh vien: Ngo Nguyen Thanh Dat - MSSV: 2224801030332
echo =========================================================================
echo.
echo [1/2] Dang day ma nguon len Repo 1: nntd260604-max/SolarNgoNguyenThanhDat...
git push -u origin main
if %errorlevel% equ 0 (
    echo  -> Day len Repo 1 THANH CONG!
) else (
    echo  -> Loi day len Repo 1. Vui long kiem tra quyen truy cap hoac Token!
)

echo.
echo [2/2] Dang day ma nguon len Repo 2: Awac8989/SolarNgoNguyenThanhDat...
git push backup main
if %errorlevel% equ 0 (
    echo  -> Day len Repo 2 THANH CONG!
) else (
    echo  -> Luu y: Neu Awac8989 la tai khoan khac, hay Add 'nntd260604-max' lam Collaborator tren repo nay!
)

echo.
echo =========================================================================
echo   HOAN TAT TIEN TRINH DAY CODE. AN PHIM BAT KY DE THOAT...
echo =========================================================================
pause >nul
