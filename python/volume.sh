#!/bin/bash
    
TALKING_PERIOD=16
UP_SOUND_PERC=65
DOWN_SOUND_PERC=45
counter=0

while true; do
    echo "counter: " $counter
    if [ "$counter" -eq 0 ]; then
        nmb=$(arecord -d 1 /dev/shm/tmp_rec.wav ; sox -t .wav /dev/shm/tmp_rec.wav -n stat 2>&1 | grep "Maximum amplitude" | cut -d ':' -f 2)

        echo "nmb: " $nmb

        if (( $(echo "$nmb > 0.3" |bc -l) )); then
            echo "ticho"
            amixer -D pulse sset Master 45%
            counter=$TALKING_PERIOD
        else
            echo "hlasno"
            amixer -D pulse sset Master 65%
        fi
    fi

    if [[ $counter -gt 0 ]]; then
        ((counter--))
    fi

    sleep 1

done
