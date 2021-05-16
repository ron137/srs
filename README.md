Run SRS

docker run --rm --name srs -p 1935:1935 -p 1985:1985 -p 8080:8080 \
    -v "/$(pwd)/conf/srs.conf:/usr/local/srs/conf/srs.conf" \
    -v "/$(pwd)/srs.log:/usr/local/srs/objs/srs.log" \
    ossrs/srs:3

Read logs:
    docker exec -it srs tail -f ./objs/srs.log

Publish Using FFMPEG

while true; \
do \
    ffmpeg -re -i ./srs/trunk/doc/source.200kbps.768x320.flv \
        -vcodec copy -acodec copy \
        -f flv -y rtmp://127.0.0.1/live/livestream; \
done




Watch Streaming (HLS)

http://players.akamai.com/players/hlsjs?streamUrl=http%3A%2F%2F127.0.0.1%3A8080%2Flive%2Flivestream.m3u8

Transcoded (720p):
http://players.akamai.com/players/hlsjs?streamUrl=http%3A%2F%2F127.0.0.1%3A8080%2Flive%2Flivestream_720.m3u8


start default HTTP callback server:
    python srs/trunk/research/api-server/server.py 8085

Enter the container:
    docker exec -it srs /bin/bash


multiple bitrate of hls:
https://github.com/ossrs/srs/issues/463
https://gist.github.com/jb-alvarado/1e94e313b57caf225127f80812fbd896
