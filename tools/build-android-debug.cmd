@echo off
setlocal

set "STUDIO_JBR=C:\Program Files\Android\Android Studio\jbr"
set "LOCAL_SDK=%LOCALAPPDATA%\Android\Sdk"
set "FALLBACK_JDK=C:\Sardar ji\tools\jdk21\jdk-21.0.10+7"
set "FALLBACK_SDK=C:\Sardar ji\tools\android-sdk"

if exist "%STUDIO_JBR%\bin\java.exe" (
  set "JAVA_HOME=%STUDIO_JBR%"
) else (
  set "JAVA_HOME=%FALLBACK_JDK%"
)

if exist "%LOCAL_SDK%\platform-tools" (
  set "ANDROID_HOME=%LOCAL_SDK%"
) else (
  set "ANDROID_HOME=%FALLBACK_SDK%"
)

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo Java runtime not found. Install Android Studio or restore tools\jdk21.
  exit /b 1
)

if not exist "%ANDROID_HOME%\platform-tools" (
  echo Android SDK not found. Open Android Studio once to install the SDK.
  exit /b 1
)

if not exist "C:\Sardar ji\dist\index.html" (
  echo Web build not found at dist\index.html. Run npm run build first.
  exit /b 1
)

set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%"

echo Using JAVA_HOME=%JAVA_HOME%
echo Using ANDROID_HOME=%ANDROID_HOME%
echo Mirroring latest web assets into Android app bundle...

if not exist "C:\Sardar ji\android\app\src\main\assets\public" (
  mkdir "C:\Sardar ji\android\app\src\main\assets\public"
)

robocopy "C:\Sardar ji\dist" "C:\Sardar ji\android\app\src\main\assets\public" /MIR >nul
set "ROBOCOPY_EXIT=%ERRORLEVEL%"
if %ROBOCOPY_EXIT% GEQ 8 (
  echo Failed to mirror latest web assets into Android app bundle.
  exit /b %ROBOCOPY_EXIT%
)

if exist "C:\Sardar ji\android\app\build\intermediates\assets" (
  rmdir /s /q "C:\Sardar ji\android\app\build\intermediates\assets"
)

powershell -ExecutionPolicy Bypass -File "C:\Sardar ji\tools\ensure-android-push-plugin.ps1"
if errorlevel 1 exit /b %ERRORLEVEL%

pushd C:\Sardar ji\android
call gradlew.bat assembleDebug
set "GRADLE_EXIT=%ERRORLEVEL%"
popd

exit /b %GRADLE_EXIT%
