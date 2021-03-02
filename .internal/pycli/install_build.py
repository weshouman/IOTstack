#!/usr/bin/env python3
import signal

checkedMenuItems = []
results = {}

def main():
  import os
  import time
  import math
  import sys
  import subprocess
  from deps.chars import specialChars, commonTopBorder, commonBottomBorder, commonEmptyLine, padText
  # from deps.consts import servicesDirectory, templatesDirectory, volumesDirectory, buildCache, envFile, dockerPathOutput, servicesFileName, composeOverrideFile
  from deps.api import getPreviousBuildList, checkWuiState
  from blessed import Terminal
  global signal
  global renderMode
  global term
  global paginationSize
  global paginationStartIndex
  global hideHelpText
  global activeMenuLocation
  global lastSelection
  global apiPreviousBuildList
  global wuiState

  # Runtime vars
  menu = []
  term = Terminal()
  hotzoneLocation = [6, 0] # Top text
  paginationToggle = [min(10, term.height - 23), term.height - 20] # Top text + controls text
  paginationStartIndex = 0
  paginationSize = paginationToggle[0]
  activeMenuLocation = 0
  lastSelection = 0
  
  try: # If not already set, then set it.
    hideHelpText = hideHelpText
  except:
    hideHelpText = False

  def getBuildList():
    global apiPreviousBuildList
    apiPreviousBuildList = getPreviousBuildList('http://localhost:32128')
    return apiPreviousBuildList

  def getWuiState():
    global wuiState
    wuiState = checkWuiState('http://localhost:327777')
    return wuiState

  def buildListToMenuItems():
    if 'buildsList' in apiPreviousBuildList['json']:
      for (index, build) in enumerate(apiPreviousBuildList['json']['buildsList']):
        menu.append([build])

  def generateLineText(text, textLength=None, paddingBefore=0, lineLength=26):
    result = ""
    for i in range(paddingBefore):
      result += " "

    textPrintableCharactersLength = textLength

    if (textPrintableCharactersLength) == None:
      textPrintableCharactersLength = len(text)

    result += text
    remainingSpace = lineLength - textPrintableCharactersLength

    for i in range(remainingSpace):
      result += " "
    
    return result

  def renderHotZone(term, renderType, menu, selection, paddingBefore, allIssues):
    global paginationSize
    selectedTextLength = len("-> ")

    print(term.move(hotzoneLocation[0], hotzoneLocation[1]))

    if paginationStartIndex >= 1:
      print(term.center("{b}     {uaf}       {uaf}{uaf}{uaf}                                         {ual}      {b}".format(
        b=specialChars[renderMode]["borderVertical"],
        uaf=specialChars[renderMode]["upArrowFull"],
        ual=specialChars[renderMode]["upArrowLine"]
      )))
    else:
      print(term.center(commonEmptyLine(renderMode)))

    menuItemsActiveRow = term.get_location()[0]
    if renderType == 2 or renderType == 1: # Rerender entire hotzone
      for (index, menuItem) in enumerate(menu): # Menu loop
        if index >= paginationStartIndex and index < paginationStartIndex + paginationSize:
          lineText = generateLineText(menuItem[0], paddingBefore=paddingBefore)

          # Menu highlight logic
          if index == selection:
            activeMenuLocation = term.get_location()[0]
            formattedLineText = '-> {t.blue_on_green}{title}{t.normal} <-'.format(t=term, title=menuItem[0])
            paddedLineText = generateLineText(formattedLineText, textLength=len(menuItem[0]) + selectedTextLength, paddingBefore=paddingBefore - selectedTextLength)
            toPrint = paddedLineText
          else:
            toPrint = '{title}{t.normal}'.format(t=term, title=lineText)
          # #####

          leftPad = ''
          rightPad = ''

          for i in range(8):
            leftPad += " "

          for i in range(23):
            rightPad += " "

          toPrint = leftPad + toPrint + rightPad

          toPrint = "{bv} {toPrint}  {bv}".format(bv=specialChars[renderMode]["borderVertical"], toPrint=toPrint) # Generate border
          toPrint = term.center(toPrint) # Center Text (All lines should have the same amount of printable characters)

          print(toPrint)


    if renderType == 3: # Only partial rerender of hotzone (the unselected menu item, and the newly selected menu item rows)
      global lastSelection
      global renderOffsetLastSelection
      global renderOffsetCurrentSelection
      # TODO: Finish this, currently disabled. To enable, update the actions for UP and DOWN array keys below to assigned 3 to needsRender
      renderOffsetLastSelection = lastSelection - paginationStartIndex
      renderOffsetCurrentSelection = selection - paginationStartIndex
      lineText = generateLineText(menu[lastSelection][0], paddingBefore=paddingBefore)
      toPrint = '{title}{t.normal}'.format(t=term, title=lineText)
      print('{t.move_y(lastSelection)}{title}'.format(t=term, title=toPrint))

      print(renderOffsetCurrentSelection, lastSelection, renderOffsetLastSelection)
      lastSelection = selection

    if paginationStartIndex + paginationSize < len(menu):
      print(term.center("{b}     {dal}       {daf}{daf}{daf}                                         {dal}      {b}".format(
        b=specialChars[renderMode]["borderVertical"],
        daf=specialChars[renderMode]["downArrowFull"],
        dal=specialChars[renderMode]["downArrowLine"]
      )))
    else:
      print(term.center(commonEmptyLine(renderMode)))

  def mainRender(menu, selection, renderType = 1):
    global paginationStartIndex
    global paginationSize
    paddingBefore = 4

    allIssues = []

    if selection >= paginationStartIndex + paginationSize:
      paginationStartIndex = selection - (paginationSize - 1) + 1
      renderType = 1
      
    if selection <= paginationStartIndex - 1:
      paginationStartIndex = selection
      renderType = 1

    try:
      if (renderType == 1):
        print(term.clear())
        print(term.move_y(7 - hotzoneLocation[0]))
        print(term.black_on_cornsilk4(term.center('IOTstack Build Installer Menu')))
        print("")
        print(term.center(commonTopBorder(renderMode)))

        print(term.center(commonEmptyLine(renderMode)))
        print(term.center("{bv}      Select build to install                                   {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
        print(term.center(commonEmptyLine(renderMode)))
        print(term.center(commonEmptyLine(renderMode)))
        print(term.center(commonEmptyLine(renderMode)))

      renderHotZone(term, renderType, menu, selection, paddingBefore, allIssues)

      if (renderType == 1):
        print(term.center(commonEmptyLine(renderMode)))
        if not hideHelpText:
          room = term.height - (16 + paginationSize)
          if room < 0:
            print(term.center(commonEmptyLine(renderMode)))
            print(term.center("{bv}   Not enough vertical room to render text ({th}, {rm})           {bv}".format(bv=specialChars[renderMode]["borderVertical"], th=padText(str(term.height), 3), rm=padText(str(room), 3))))
            print(term.center(commonEmptyLine(renderMode)))
          else:
            print(term.center(commonEmptyLine(renderMode)))
            print(term.center("{bv}      Controls:                                                 {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}      [Up] and [Down] to move selection cursor                  {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}      [Tab] Expand or collapse build menu size                  {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}      [H] Show/hide this text                                   {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}      [Space] Reload build list                                 {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}      [Enter] to install build                                  {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}      [Escape] to cancel build install                          {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center(commonEmptyLine(renderMode)))
            print(term.center(commonEmptyLine(renderMode)))
        print(term.center(commonEmptyLine(renderMode)))
        print(term.center(commonBottomBorder(renderMode)))

        if len(allIssues) > 0:
          print(term.center(""))
          print(term.center(""))
          print(term.center(""))
          print(term.center(("{btl}{bh}{bh}{bh}{bh}{bh}{bh} Build Issues "
            "{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}"
            "{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}"
            "{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}"
            "{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}"
            "{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}"
            "{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}"
            "{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}{bh}"
            "{bh}{bh}{bh}{bh}{bh}{bh}{bh}{btr}").format(
            btl=specialChars[renderMode]["borderTopLeft"],
            btr=specialChars[renderMode]["borderTopRight"],
            bh=specialChars[renderMode]["borderHorizontal"]
          )))
          print(term.center(commonEmptyLine(renderMode, size = 139)))
          print(term.center(commonEmptyLine(renderMode, size = 139)))
          print(term.center(commonBottomBorder(renderMode, size = 139)))

    except Exception as err: 
      print("There was an error rendering the menu:")
      print(err)
      print("Press [Esc] to go back")
      return

    return

  def onResize(sig, action):
    global paginationToggle
    paginationToggle = [10, term.height - 25]
    mainRender(menu, selection, 1)

  if __name__ == 'builtins':
    global results
    global signal
    needsRender = 1
    signal.signal(signal.SIGWINCH, onResize)
    with term.fullscreen():
      print('Loading build list...')
      getBuildList()
      buildListToMenuItems()
      selection = 0
      mainRender(menu, selection, 1)
      selectionInProgress = True
      with term.cbreak():
        while selectionInProgress:
          key = term.inkey(esc_delay=0.05)
          if key.is_sequence:
            if key.name == 'KEY_TAB':
              needsRender = 1
              if paginationSize == paginationToggle[0]:
                paginationSize = paginationToggle[1]
                paginationStartIndex = 0
              else:
                paginationSize = paginationToggle[0]
            if key.name == 'KEY_DOWN':
              selection += 1
              needsRender = 2
            if key.name == 'KEY_UP':
              selection -= 1
              needsRender = 2
            if key.name == 'KEY_ENTER':
              setCheckedMenuItems()
              checkForIssues()
              selectionInProgress = False
              results["buildState"] = buildServices()
              return results["buildState"]
            if key.name == 'KEY_ESCAPE':
              results["buildState"] = False
              return results["buildState"]
          elif key:
            if key == ' ': # Space pressed
              print('Loading build list...')
              getBuildList()
              buildListToMenuItems()
            if key == 'h': # H pressed
              if hideHelpText:
                hideHelpText = False
              else:
                hideHelpText = True
              needsRender = 1
          else:
            print(key)
            time.sleep(0.5)

          selection = selection % len(menu)

          mainRender(menu, selection, needsRender)

originalSignalHandler = signal.getsignal(signal.SIGINT)
main()
signal.signal(signal.SIGWINCH, originalSignalHandler)
