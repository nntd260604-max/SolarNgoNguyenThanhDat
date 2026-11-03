@echo off
chcp 65001 >nul
echo =========================================================================
echo   DONG BO MA NGUON HOANG GIANG SOLAR LEN GITHUB
echo   Sinh vien: Ngo Nguyen Thanh Dat - MSSV: 2224801030332
echo   Repository: https://github.com/nntd260604-max/SolarNgoNguyenThanhDat
echo =========================================================================
echo.
echo Dang day ma nguon len GitHub (origin main)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo =========================================================================
    echo  -> DAY CODE THANH CONG 100%%!
    echo  -> Xem du an tai: https://github.com/nntd260604-max/SolarNgoNguyenThanhDat
    echo =========================================================================
) else (
    echo.
    echo [!] Neu trinh duyet yeu cau dang nhap, hay chon 'Sign in with your browser' de xac thuc.
)

echo.
pause
