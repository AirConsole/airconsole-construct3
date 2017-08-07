@echo off

echo ########################################################
echo #           _       _____                      _       #
echo #     /\   (_)     / ____^|                    ^| ^|      #
echo #    /  \   _ _ __^| ^|     ___  _ __  ___  ___ ^| ^| ___  #
echo #   / /\ \ ^| ^| '__^| ^|    / _ \^| '_ \/ __^|/ _ \^| ^|/ _ \ #
echo #  / ____ \^| ^| ^|  ^| ^|___^| (_) ^| ^| ^| \__ \ (_) ^| ^|  __/ #
echo # /_/    \_\_^|_^|   \_____\___/^|_^| ^|_^|___/\___/^|_^|\___^| #
echo #                                                      #
echo #                Tool by Psychokiller1888              #
echo #                         v1.0.0                       #
echo ########################################################
echo.

echo This script is no longer usefull
pause
exit

if not exist index.html (
	echo index.html not found
	echo Please run this batch file in your exported Construct3 game directory
	echo.
	pause
	exit
)

echo This tool will correctly add the AirConsole API import and rename your index.html file.
echo.
pause
echo.

if exist screen.html (
	del screen.html
)

(
	setlocal DisableDelayedExpansion
	for /F "delims=" %%L in ('findstr /n "^" "index.html"') do (
		set "line=%%L"
		setlocal EnableDelayedExpansion
		if "!line:~0,3!"=="17:" echo ^<script src="https://www.airconsole.com/api/airconsole-1.7.0.js"^>^</script^>
		set "line=!line:*:=!"
		echo(!line!
		endlocal
	)
) > "screen.html"

echo We are done!
echo Do you want to delete the original index.html file? It shouldn't be present for AirConsole
set /p answer=(Y)es or (N)o: 
if "%answer%" == "y" del index.html

echo.
echo Thank you for using AirConsole
echo Stay in touch with us on our Discord channel
echo or visit us on www.airconsole.com
echo.

pause
