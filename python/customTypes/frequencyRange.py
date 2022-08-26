from enum import Enum     # for enum34, or the stdlib version
# from aenum import Enum  # for the aenum version
# FrequencyRange = Enum('LOW', 'MID', 'HIGH',"ALL")
class FrequencyRange:
    low = [0,11]
    midL = [12,28]
    midH = [29,39]
    mid = [midL[0],midH[1]]
    high = [40,64]
    midHigh = [mid[0],high[1]]
    all = [0,64]