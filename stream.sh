while true; \
do \
    ffmpeg -re -i ./sample.mp4 \
        -vcodec copy -acodec copy \
        -f flv -y rtmp://localhost/live/livestream?token=A9FryxceScXhnhxychG9CjbdpP8aQ7ax; \
done
