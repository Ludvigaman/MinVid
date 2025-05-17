@echo off
setlocal

:: Get the path of the current script
set "scriptDir=%~dp0"

:: Construct the path to ffmpeg (one folder up, then into MinVid-API\Utils)
set "ffmpegPath=%scriptDir%..\MinVid-API\Utils\ffmpeg.exe"

:: Prompt for video URL
set /p videoUrl=Enter the video URL: 

:: Run ffmpeg using the constructed path
"%ffmpegPath%" -i "%videoUrl%" -c copy -bsf:a aac_adtstoasc output.mp4

pause
endlocal
