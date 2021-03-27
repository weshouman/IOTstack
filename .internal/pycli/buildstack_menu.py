#!/usr/bin/env python3
import signal

checkedMenuItems = []
results = {}

def main():
  import os
  import time
  import ruamel.yaml
  import math
  import sys
  import traceback
  import subprocess
  from deps.chars import specialChars, commonTopBorder, commonBottomBorder, commonEmptyLine, padText
  from deps.api import getBuildServicesList, getBuildServicesJsonList, getBuildServicesMetaData, getBuildServicesOptionsData, saveBuild, checkBuild
  from blessed import Terminal
  global signal
  global renderMode
  global term
  global paginationSize
  global paginationStartIndex
  global hideHelpText
  global activeMenuLocation
  global lastSelection
  global apiServicesList
  global apiServicesJson
  global apiServicesMetadata
  global apiServicesOptions
  global apiCheckBuild
  global apiBuildOutput
  global selectedServices
  global serviceConfigurations
  global hasIssuesChecked

  # Runtime vars
  menu = []
  selectedServices = []
  serviceConfigurations = {
    "services": {}
  }
  hasIssuesChecked = False
  apiServicesList = None
  apiServicesJson = None
  apiServicesMetadata = None
  apiServicesOptions = None
  apiCheckBuild = None
  apiBuildOutput = None
  term = Terminal()
  hotzoneLocation = [7, 0] # Top text
  paginationToggle = [10, term.height - 22] # Top text + controls text
  paginationStartIndex = 0
  paginationSize = paginationToggle[0]
  activeMenuLocation = 0
  lastSelection = 0
  
  try: # If not already set, then set it.
    hideHelpText = hideHelpText
  except:
    hideHelpText = False

  def checkForIssues():
    try:
      global apiCheckBuild
      apiCheckBuild = checkBuild(os.getenv('API_ADDR'), selectedServices, serviceConfigurations)
      return True
    except Exception as err: 
      print("Issue checking build:")
      print(err)
      input("Press Enter to continue...")
      return False

  def buildServices():
    try:
      global apiBuildOutput
      apiBuildOutput = saveBuild(os.getenv('API_ADDR'), selectedServices, serviceConfigurations)
      return True
    except Exception as err: 
      print("Issue running build:")
      print(err)
      input("Press Enter to continue...")
      return False

  def generateLineText(text, textLength=None, paddingBefore=0, lineLength=24):
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
    optionsLength = len(" >>  Options ")
    optionsIssuesSpace = len("  ")
    selectedTextLength = len("-> ")
    spaceAfterissues = len(" ")
    issuesLength = len(" !! Issue ")

    print(term.move(hotzoneLocation[0], hotzoneLocation[1]))

    if paginationStartIndex >= 1:
      print(term.center("{b}   {uaf}      {uaf}{uaf}{uaf}                      {ual}                          {b}".format(
        b=specialChars[renderMode]["borderVertical"],
        uaf=specialChars[renderMode]["upArrowFull"],
        ual=specialChars[renderMode]["upArrowLine"]
      )))
    else:
      print(term.center(commonEmptyLine(renderMode)))

    menuItemsActiveRow = term.get_location()[0]
    if renderType == 2 or renderType == 1: # Rerender entire hotzone
      for (index, menuItem) in enumerate(menu): # Menu loop
        if "issues" in menuItem[2] and menuItem[2]["issues"]:
          allIssues.append({ "serviceName": menuItem[0], "issues": menuItem[1]["issues"] })

        if index >= paginationStartIndex and index < paginationStartIndex + paginationSize:

          # Menu highlight logic
          if index == selection:
            lineText = generateLineText(menuItem[0], paddingBefore=paddingBefore)
            activeMenuLocation = term.get_location()[0]
            formattedLineText = '-> {t.blue_on_green}{title}{t.normal} <-'.format(t=term, title=menuItem[0][0:21])
            paddedLineText = generateLineText(formattedLineText, textLength=len(menuItem[0]) + selectedTextLength, paddingBefore=paddingBefore - selectedTextLength)
            toPrint = paddedLineText
          else:
            titleLength = len("longest title be4 trunc")
            menuItemTitle = menuItem[0]
            if len(menuItemTitle) > titleLength:
              menuItemTitle = menuItemTitle[0:titleLength - 3] + '...'

            lineText = generateLineText(menuItemTitle, paddingBefore=paddingBefore)
            toPrint = '{title}{t.normal}'.format(t=term, title=lineText)
          # #####

          # Options and issues
          # if "options" in menuItem[2] and not menuItem[2]["options"] == None:
          #   toPrint = toPrint + '{t.blue_on_black} {raf}{raf}{t.normal}'.format(t=term, raf=specialChars[renderMode]["rightArrowFull"])
          #   toPrint = toPrint + ' {t.white_on_black} Options {t.normal}'.format(t=term)
          # else:
          #   for i in range(optionsLength):
          #     toPrint += " "
          for i in range(optionsLength): # Skip rendering for now.
            toPrint += " "

          for i in range(optionsIssuesSpace):
            toPrint += " "

          if "issues" in menuItem[2] and menuItem[2]["issues"]:
            toPrint = toPrint + '{t.red_on_orange} !! {t.normal}'.format(t=term)
            toPrint = toPrint + ' {t.orange_on_black} Issue {t.normal}'.format(t=term)
          else:
            if menuItem[2]["checked"]:
              if not menuItem[2]["issues"] == None and len(menuItem[2]["issues"]) == 0:
                toPrint = toPrint + '   {t.green_on_blue} Pass {t.normal} '.format(t=term)
              else:
                for i in range(issuesLength):
                  toPrint += " "
            else:
              for i in range(issuesLength):
                toPrint += " "

          for i in range(spaceAfterissues):
            toPrint += " "
          # #####

          # Menu check render logic
          if menuItem[2]["checked"]:
            toPrint = " (X) " + toPrint
          else:
            toPrint = " ( ) " + toPrint

          toPrint = "{bv} {toPrint}  {bv}".format(bv=specialChars[renderMode]["borderVertical"], toPrint=toPrint) # Generate border
          toPrint = term.center(toPrint) # Center Text (All lines should have the same amount of printable characters)
          # #####
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
      print(term.center("{b}   {daf}      {daf}{daf}{daf}                      {dal}                          {b}".format(
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
        print(term.black_on_cornsilk4(term.center('IOTstack Build Menu')))
        print("")
        print(term.center(commonTopBorder(renderMode)))

        print(term.center(commonEmptyLine(renderMode)))
        print(term.center("{bv}      Select containers to build                              {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
        print(term.center(commonEmptyLine(renderMode)))
        print(term.center(commonEmptyLine(renderMode)))
        print(term.center(commonEmptyLine(renderMode)))

      if len(menu) > 0:
        renderHotZone(term, renderType, menu, selection, paddingBefore, allIssues)
      else:
        print(term.center("{bv}    No menu items were loaded. Press [ESC] to go back         {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
        print(term.center(commonEmptyLine(renderMode)))

      if (renderType == 1):
        print(term.center(commonEmptyLine(renderMode)))
        if not hideHelpText:
          room = term.height - (28 + len(allIssues) + paginationSize)
          if room < 0:
            allIssues.append({ "serviceName": "BuildStack Menu", "issues": { "screenSize": 'Not enough scren height to render correctly (t-height = ' + str(term.height) + ' v-lines = ' + str(room) + ')' } })
            print(term.center(commonEmptyLine(renderMode)))
            print(term.center("{bv} Not enough vertical room to render controls help text (H:{th}, V:{rm}) {bv}".format(bv=specialChars[renderMode]["borderVertical"], th=padText(str(term.height), 3), rm=padText(str(room), 3))))
            print(term.center(commonEmptyLine(renderMode)))
          else:
            print(term.center(commonEmptyLine(renderMode)))
            print(term.center("{bv}    Controls:                                                 {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}    [Space] to select or deselect service                     {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}    [Up] and [Down] to move selection cursor                  {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}    [Right] for options for containers that support them      {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}    [Tab] Expand or collapse build menu size                  {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}    [H] Show/hide this text                                   {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}    [R] Refresh list                                          {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            # print(term.center("{bv}    [F] Filter options                                        {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            if hasIssuesChecked:
              print(term.center("{bv}    [Enter] to build                                          {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            else:
              print(term.center("{bv}    [Enter] to check build                                    {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center("{bv}    [Escape] to cancel build                                  {bv}".format(bv=specialChars[renderMode]["borderVertical"])))
            print(term.center(commonEmptyLine(renderMode)))
            print(term.center(commonEmptyLine(renderMode)))
        print(term.center(commonEmptyLine(renderMode)))
        print(term.center(commonBottomBorder(renderMode)))

        if not apiCheckBuild == None and 'json' in apiCheckBuild and 'issueList' in apiCheckBuild['json']:
          if 'services' in apiCheckBuild['json']['issueList']:
            if len(apiCheckBuild['json']['issueList']['services']) > 0:
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
              issuesList = apiCheckBuild['json']['issueList']
              for service in issuesList['services']:
                spacesAndBracketsLen = 5
                issueAndTypeLen = len(service['message']) + len(service['name']) + spacesAndBracketsLen
                serviceNameAndConflictType = '{t.red_on_black}{service}{t.normal} ({t.yellow_on_black}{message}{t.normal}) '.format(t=term, service=service['name'], message=service['issueType'])
                formattedServiceNameAndConflictType = generateLineText(str(serviceNameAndConflictType), textLength=issueAndTypeLen, paddingBefore=0, lineLength=32)
                issueDescription = generateLineText(str(service['message']), textLength=len(str(service['message'])), paddingBefore=0, lineLength=103)
                print(term.center("{bv} {nm} - {desc} {bv}".format(nm=formattedServiceNameAndConflictType, desc=issueDescription, bv=specialChars[renderMode]["borderVertical"]) ))
              print(term.center(commonEmptyLine(renderMode, size = 139)))
              print(term.center(commonBottomBorder(renderMode, size = 139)))

    except Exception as err: 
      print("There was an error rendering the menu:")
      print(err)
      print('Error reported:')
      print(sys.exc_info())
      traceback.print_exc()
      print("Press [Esc] to go back")
      return

    return

  def checkMenuItem(selection):
    global selectedServices
    global hasIssuesChecked
    hasIssuesChecked = False

    if menu[selection][2]["checked"] == True:
      menu[selection][2]["checked"] = False
      while menu[selection][1] in selectedServices: selectedServices.remove(menu[selection][1])
    else:
      menu[selection][2]["checked"] = True
      selectedServices.append(menu[selection][1])

  def onResize(sig, action):
    global paginationToggle
    paginationToggle = [10, term.height - 25]
    mainRender(menu, selection, 1)

  def populateMenu():
    global hasIssuesChecked
    hasIssuesChecked = False
    menu.clear()
    hasError = []
    if not apiServicesList == None and 'json' in apiServicesList:
      for service in apiServicesList['json']:
        try:
          itemChecked = False
          if service in selectedServices:
            itemChecked = True

          menu.append([service, service, { "checked": itemChecked, "options": None, "tags": [], "issues": [] }])
          menu[-1][0] = apiServicesMetadata['json'][service]['displayName']
          menu[-1][2]["tags"] = apiServicesMetadata['json'][service]['serviceTypeTags']

          if service in apiServicesOptions['json']:
            menu[-1][2]["options"] = apiServicesOptions['json'][service]
        except Exception as err:
          hasError.append([service, err])
    else:
      print("Menu could not be loaded. API call did not return JSON:")
      print(apiServicesList)
      input("Press [Enter] to continue")

    if len(hasError) > 0:
      print("There were errors loading the menu:")
      for errorItem in hasError:
        print(errorItem)
      input("Press [Enter] to continue")
      return False
    return True

  def loadMenu():
    global apiServicesList
    global apiServicesJson
    global apiServicesMetadata
    global apiServicesOptions
    print('Loading Build Services...')
    apiServicesList = getBuildServicesList(os.getenv('API_ADDR'))
    print('Loading Service Templates...')
    apiServicesJson = getBuildServicesJsonList(os.getenv('API_ADDR'))
    print('Loading Service Metadatas...')
    apiServicesMetadata = getBuildServicesMetaData(os.getenv('API_ADDR'))
    print('Loading Service Options...')
    apiServicesOptions = getBuildServicesOptionsData(os.getenv('API_ADDR'))
    print('Loading Done')
    populateMenu()

  if __name__ == 'builtins':
    global results
    global signal
    needsRender = 1
    signal.signal(signal.SIGWINCH, onResize)
    loadMenu()
    with term.fullscreen():
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
            # if key.name == 'KEY_RIGHT': # TODO: Implement options
            #   executeServiceOptions()
            if key.name == 'KEY_ENTER':
              if hasIssuesChecked == False:
                checkForIssues()
                # input(apiCheckBuild)
                hasIssuesChecked = True
                needsRender = 1
              else:
                selectionInProgress = False
                buildServices()
                input(apiBuildOutput) # TODO: Remove this
            if key.name == 'KEY_ESCAPE':
              results["buildState"] = False
              return results["buildState"]
          elif key:
            if key == ' ': # Space pressed
              checkMenuItem(selection) # Update checked list
              needsRender = 1
            elif key == 'h': # H pressed
              if hideHelpText:
                hideHelpText = False
            elif key == 'r': # R pressed
              loadMenu()
            else:
              hideHelpText = True
            needsRender = 1
          else:
            print(key)
            time.sleep(0.5)

          if len(menu) > 0:
            selection = selection % len(menu)

          mainRender(menu, selection, needsRender)

originalSignalHandler = signal.getsignal(signal.SIGINT)
main()
signal.signal(signal.SIGWINCH, originalSignalHandler)
