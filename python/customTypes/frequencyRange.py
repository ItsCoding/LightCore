from enum import Enum     # for enum34, or the stdlib version
# from aenum import Enum  # for the aenum version
# FrequencyRange = Enum('LOW', 'MID', 'HIGH',"ALL")
class FrequencyRange(Enum):
    LOW = 0
    MID = 1
    HIGH = 2
    ALL = 3