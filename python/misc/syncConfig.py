import config
import randomizer as rnd
def syncConfig (vis, incommingConfig):

    udpIps = {}
    udpGroups = {}
    udpFrameDividers = {}
    stripLedCount = {}
    stripMirrors = {}
    stripsByLCID = {}
    for stripID in incommingConfig["strips"]:
        strip = incommingConfig["strips"][stripID]
        if strip["lcid"] not in stripsByLCID:
            stripsByLCID[strip["lcid"]] = []
        stripsByLCID[strip["lcid"]].append(strip)

    for lcid, strips in stripsByLCID.items():
        if len(strips) > 1:
            udpIps[lcid] = "GROUP"
            udpGroups[lcid] = []
            sumLeds = 0
            for strip in strips:
                udpGroups[lcid].append({
                    "from": ("stripControllerStart" in strip and strip["stripControllerStart"]) or 0,
                    "to": ("stripCotrollerEnd" in strip and strip["stripCotrollerEnd"]) or strip["leds"],
                    "IP": ("stripIP" in strip and strip["stripIP"]) or "127.0.0.1",
                    "offset": ("offset" in strip and strip["offset"]) or 0,
                    "invert": ("stripInverted" in strip and strip["stripInverted"]) or False
                })
                if "frameDivider" in strip:
                    udpFrameDividers[lcid] = strip["frameDivider"]
                sumLeds += strip["leds"]
            stripLedCount[lcid] = sumLeds
            if "mirrorGroup" in strip:
                if strip["mirrorGroup"] not in stripMirrors:
                    stripMirrors[strip["mirrorGroup"]] = []
                stripMirrors[strip["mirrorGroup"]].append(lcid)
            
        else:
            if "stripIP" in strips[0]:
                udpIps[lcid] = strips[0]["stripIP"]
            else:
                udpIps[lcid] = "127.0.0.1"
                print ("!!!! no stripIP for strip", lcid)
            if "frameDivider" in strips[0]:
                udpFrameDividers[lcid] = strips[0]["frameDivider"]
            stripLedCount[int(lcid)] = strips[0]["leds"]
            if "mirrorGroup" in strips[0]:
                if strips[0]["mirrorGroup"] not in stripMirrors:
                    stripMirrors[strips[0]["mirrorGroup"]] = []
                stripMirrors[strips[0]["mirrorGroup"]].append(lcid)
    
    countOfStrips = len(udpIps)
    mirrorArray = []
    for groupId, items in stripMirrors.items():
        # get unique items
        items = list(set(items))
        mirrorArray.append(items)
    
    config.UDP_IPS = udpIps
    config.UDP_GROUPS = udpGroups
    config.UDP_FRAMEDIVIDER = udpFrameDividers

    stripLedCountsArray = []
    for i in range(0,countOfStrips):
        # print("LED: ", i, " ", stripLedCount[i])
        if i in stripLedCount:
            stripLedCountsArray.append(stripLedCount[i])
        else:
            print("ERROR: stripLedCount not found for strip", i)

    config.STRIP_LED_COUNTS = stripLedCountsArray
    config.STRIP_COUNT = countOfStrips
    for i in range(countOfStrips):
        if str(i) not in config.BLACKLISTED_EFFECTS:
            config.BLACKLISTED_EFFECTS[str(i)] = []
        if i not in config.STRIP_BRIGHTNESS:
            config.STRIP_BRIGHTNESS[i] = 100

    # print("udpIps", udpIps)
    # print("udpGroups", udpGroups)
    # print("udpFrameDividers",udpFrameDividers)
    # print("stripLedCountsArray",stripLedCountsArray)
    # print("stripLedCount",stripLedCount)
    # print("countOfStrips",countOfStrips)
    # print("stripMirrors",stripMirrors)
    # print("mirrorArray",mirrorArray)



    if (countOfStrips > 0): 
        print("Successfully loaded config from server, got {} strips".format(countOfStrips))
        vis.configReady = True
        rnd.makeRandomComposition("all",True)
    else:
        print("ERROR: No strips found in config, deactivating pipeline")
        vis.configReady = False
