from enum import Enum     # for enum34, or the stdlib version
# from aenum import Enum  # for the aenum version
# FrequencyRange = Enum('LOW', 'MID', 'HIGH',"ALL")
class FrequencyRange:
    low = [0,4]
    mid = [5,8]
    high = [16,32]
    all = [0,32]
    lowMid = [0,8]
    midHigh = [4,32]