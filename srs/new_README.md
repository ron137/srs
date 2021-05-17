Run SRS

docker compose up


Read logs:
    tail -f srs.log

Enter the container:
    docker compose exec live /bin/bash   


Publish Using FFMPEG

while true; \
do \
    ffmpeg -re -i ./trunk/doc/source.200kbps.768x320.flv \
        -vcodec copy -acodec copy \
        -f flv -y rtmp://127.0.0.1/live/livestream; \
done




Watch Streaming (HLS)

http://players.akamai.com/players/hlsjs?streamUrl=http%3A%2F%2F127.0.0.1%3A8080%2Flive%2Flivestream.m3u8

Transcoded (720p):
http://players.akamai.com/players/hlsjs?streamUrl=http%3A%2F%2F127.0.0.1%3A8080%2Flive%2Flivestream_720.m3u8


start default HTTP callback server:
    python srs/trunk/research/api-server/server.py 8085




multiple bitrate of hls:
https://github.com/ossrs/srs/issues/463
https://gist.github.com/jb-alvarado/1e94e313b57caf225127f80812fbd896
