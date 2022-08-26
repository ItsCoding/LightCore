from enum import Enum     # for enum34, or the stdlib version
# from aenum import Enum  # for the aenum version
# FrequencyRange = Enum('LOW', 'MID', 'HIGH',"ALL")
class FrequencyRange:
    low = [0,8]
    midL = [9,25]
    midH = [26,38]
    high = [39,64]
    all = [0,64]