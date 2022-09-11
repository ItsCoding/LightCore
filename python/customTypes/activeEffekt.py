from customTypes.frequencyRange import FrequencyRange


class ActiveEffekt:
  def __init__(self, effekt, frequencyRange: FrequencyRange, stripIndex: int, ledStartIndex: int, ledEndIndex: int, instanceData: dict,zIndex: int):
    self.effekt = effekt
    self.frequencyRange = frequencyRange
    self.stripIndex = stripIndex
    self.ledStartIndex = ledStartIndex
    self.ledEndIndex = ledEndIndex
    self.instanceData = instanceData
    self.zIndex = zIndex
