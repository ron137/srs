while true; \
do \
    ffmpeg -re -i ./sample.mp4 \
        -vcodec copy -acodec copy \
        -f flv -y rtmp://localhost/live/livestream; \
done
