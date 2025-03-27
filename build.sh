cd ../ #상위 디렉토리로 이동
mkdir output # 새로운 'output' 디렉토리 생성
cp -R ./kid-pass/* ./output # 'kid-pass' 디렉토리의 내용을 'output'으로 복사
cp -R ./output ./kid-pass/ # 'output' 디렉토리를 다시 'kid-pass' 디렉토리 안으로 복사
