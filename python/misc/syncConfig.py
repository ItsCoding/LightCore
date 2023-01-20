from config import config
import randomizer as rnd
def syncConfig (vis, incommingConfig):
    print("Parsing config...")
    udpIps = {}
    udpGroups = {}
    udpFrameDividers = {}
    stripLedCount = {}
    stripMirrors = {}
    stripsByLCID = {}
    esp_protocols = {}
    udpIndexOffset = {}
    for stripID in incommingConfig["strips"]:
        strip = incommingConfig["strips"][stripID]
        if int(strip["lcid"]) not in stripsByLCID:
            stripsByLCID[int(strip["lcid"])] = []
        stripsByLCID[int(strip["lcid"])].append(strip)

    # print keys of stripsByLCID
    for lcid in stripsByLCID:
        print("lcid: " + str(lcid))
        for strip in stripsByLCID[lcid]:
            print("    " + str(strip["name"]))

    for lcid, strips in stripsByLCID.items():
        if len(strips) > 1:
            udpIps[int(lcid)] = "GROUP"
            print("LCID", lcid, "is a group")
            udpGroups[lcid] = []
            sumLeds = 0
            for strip in strips:
                print("     Adding strip", strip["name"], "to group", lcid)
                stripIP = ("stripIP" in strip and strip["stripIP"]) or "127.0.0.1"
                udpGroups[lcid].append({
                    "from": ("stripControllerStart" in strip and strip["stripControllerStart"]) or 0,
                    "to": ("stripCotrollerEnd" in strip and strip["stripCotrollerEnd"]) or strip["leds"],
                    "IP": stripIP,
                    "offset": ("offset" in strip and strip["offset"]) or 0,
                    "invert": ("stripInverted" in strip and strip["stripInverted"]) or False
                })

                if "transportProtocol" in strip:
                    esp_protocols[stripIP] = strip["transportProtocol"]

                if "frameDivider" in strip:
                    udpFrameDividers[lcid] = strip["frameDivider"]
                if "ledType" in strip:
                    config.COLOR_CALIBRATION_ASSIGNMENTS[lcid] = strip["ledType"]
                else:
                    config.COLOR_CALIBRATION_ASSIGNMENTS[lcid] = "WS2812"
                sumLeds += strip["leds"]
            stripLedCount[lcid] = sumLeds
            if "mirrorGroup" in strip:
                if strip["mirrorGroup"] not in stripMirrors:
                    stripMirrors[strip["mirrorGroup"]] = []
                stripMirrors[strip["mirrorGroup"]].append(int(lcid))
            
        else:
            print("Adding strip", strips[0]["name"], "to single", lcid)
            if "stripIP" in strips[0]:
                udpIps[int(lcid)] = strips[0]["stripIP"]
            else:
                udpIps[int(lcid)] = "127.0.0.1"
                print ("!!!! no stripIP for strip", lcid)
            if "offset" in strips[0]:
                udpIndexOffset[lcid] = strips[0]["offset"]
            if "transportProtocol" in strips[0]:
                esp_protocols[udpIps[int(lcid)]] = strips[0]["transportProtocol"]
            if "ledType" in strip:
                config.COLOR_CALIBRATION_ASSIGNMENTS[int(lcid)] = strips[0]["ledType"]
            else:
                config.COLOR_CALIBRATION_ASSIGNMENTS[int(lcid)] = "ws2811"
            if "frameDivider" in strips[0]:
                udpFrameDividers[lcid] = strips[0]["frameDivider"]
            stripLedCount[int(lcid)] = strips[0]["leds"]
            if "mirrorGroup" in strips[0]:
                if strips[0]["mirrorGroup"] not in stripMirrors:
                    stripMirrors[strips[0]["mirrorGroup"]] = []
                stripMirrors[strips[0]["mirrorGroup"]].append(int(lcid))
    
    countOfStrips = len(udpIps)
    vis.ENDABLED_RND_PARTS = {}
    for i in range(countOfStrips):
        vis.ENDABLED_RND_PARTS[i] = True

    mirrorArray = []
    for groupId, items in stripMirrors.items():
        # get unique items
        items = list(set(items))
        mirrorArray.append(items)
    
    config.UDP_IPS = udpIps
    config.UDP_GROUPS = udpGroups
    config.UDP_FRAMEDIVIDER = udpFrameDividers
    config.UDP_INDEX_OFFSET = udpIndexOffset
    stripLedCountsArray = []
    for i in range(0,countOfStrips):
        # print("LED: ", i, " ", stripLedCount[i])
        if i in stripLedCount:
            stripLedCountsArray.append(stripLedCount[i])
        else:
            print("ERROR: stripLedCount not found for strip", i)
    config.STRIP_MIRRORS = mirrorArray
    config.STRIP_LED_COUNTS = stripLedCountsArray
    config.STRIP_COUNT = countOfStrips

    config.STRIP_BRIGHTNESS = {} # editable in client
    config.STRIP_LED_POSITIONS = incommingConfig["ledPositions"]
    # print("ledPositions", incommingConfig["ledPositions"])
    config.CANVAS_HEIGHT = int(incommingConfig["canvasSize"]["height"]) + 1
    config.CANVAS_WIDTH = int(incommingConfig["canvasSize"]["width"]) + 1
    for i in range(countOfStrips):
        if str(i) not in config.BLACKLISTED_EFFECTS:
            config.BLACKLISTED_EFFECTS[str(i)] = []
        if i not in config.STRIP_BRIGHTNESS:
            config.STRIP_BRIGHTNESS[str(i)] = 100
    config.cfg["stripBrightness"] = config.STRIP_BRIGHTNESS
    config.ESP_PROTOCOLS = esp_protocols
    print("\n =======================================")
    print("udpIps", udpIps)
    print("udpGroups", udpGroups)
    print("udpFrameDividers",udpFrameDividers)
    print("esp_protocols",esp_protocols)
    print("udpIndexOffset",udpIndexOffset)
    print("=======================================")
    print("stripLedCountsArray",stripLedCountsArray)
    print("stripLedCount",stripLedCount)
    print("countOfStrips",countOfStrips)
    print("=======================================")
    print("stripMirrors",stripMirrors)
    print("mirrorArray",mirrorArray)
    print("stripBrightness",config.STRIP_BRIGHTNESS)
    print("=======================================")
    print("Canvas Width",config.CANVAS_WIDTH)
    print("Canvas Height",config.CANVAS_HEIGHT)
    print("=======================================\n")



    if (countOfStrips > 0): 
        print("✅ Successfully loaded config from server, got {} strips \n".format(countOfStrips))
        vis.configReady = True
        rnd.makeRandomComposition("all",True)
    else:
        print("⛔️ ERROR: No strips found in config, deactivating pipeline \n")
        vis.configReady = False
