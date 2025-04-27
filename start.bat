@echo off
setlocal

:: Determine tag (default to “latest”)
if "%~1"=="" (
  set "TAG=latest"
) else (
  set "TAG=%~1"
)

echo Pulling mysql-data image...
docker pull iotinsighthub/mysql-data:%TAG%

echo Pulling backend image...
docker pull iotinsighthub/iot_backend:%TAG%

echo Pulling frontend image...
docker pull iotinsighthub/iot_frontend:%TAG%

echo Pulling other services via docker-compose...
docker-compose pull

echo Starting all containers...
docker-compose up -d

echo Done!
endlocal
