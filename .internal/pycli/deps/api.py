import requests
import time

def checkApiHealth(host, protocol="http://"):
  try:
    url = '{protocol}{host}/health/no-log'.format(host=host, protocol=protocol)
    apiRequest = requests.get(url, timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    try:
      res['json'] = apiRequest.json()
    except:
      res['json'] = None
  except:
    res = {}
    res['url'] = url
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res

def deleteBuild(host, build, protocol="http://"):
  try:
    url = '{protocol}{host}/build/delete/{build}'.format(host=host, build=build, protocol=protocol)
    apiRequest = requests.post(url, timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    try:
      res['json'] = apiRequest.json()
    except:
      res['json'] = None
  except:
    res = {}
    res['url'] = url
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res

def getTemplateBuildBootstrap(host, build, noFluff = True, protocol="http://"):
  try:
    url = '{protocol}{host}/templates/scripts/bootstrap'.format(host=host, protocol=protocol)
    requestData = {}
    requestData['options'] = {}
    requestData['options']['build'] = build

    if noFluff:
      requestData['options']['nofluff'] = True

    apiRequest = requests.post(url = url, json = requestData, timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    try:
      res['json'] = apiRequest.json()
    except:
      res['json'] = None
  except:
    res = {}
    res['url'] = url
    res['body'] = requestData
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res

def getPreviousBuildList(host, index = None, limit = None, protocol="http://"):
  try:
    requestParams = ''
    if not index == None:
      requestParams = requestParams + '/index/{index}'.format(index=index)

    if not limit == None:
      requestParams = requestParams + '/limit/{limit}'.format(limit=limit)

    url = '{protocol}{host}/build/list{requestParams}'.format(host=host, requestParams=requestParams, protocol=protocol)

    apiRequest = requests.get(url, timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    try:
      res['json'] = apiRequest.json()
    except:
      res['json'] = None
  except:
    res = {}
    res['url'] = url
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res

def checkWuiState(host, protocol="http://"):
  try:
    apiRequest = requests.get('{protocol}{host}/'.format(host=host, protocol=protocol), timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    res['json'] = None
  except:
    res = {}
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res

def getBuildServicesList(host, protocol="http://"):
  try:
    url = '{protocol}{host}/templates/services/list'.format(host=host, protocol=protocol)

    apiRequest = requests.get(url, timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    try:
      res['json'] = apiRequest.json()
    except:
      res['json'] = None
  except:
    res = {}
    res['url'] = url
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res

def getBuildServicesJsonList(host, protocol="http://"):
  try:
    url = '{protocol}{host}/templates/services/json'.format(host=host, protocol=protocol)

    apiRequest = requests.get(url, timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    try:
      res['json'] = apiRequest.json()
    except:
      res['json'] = None
  except:
    res = {}
    res['url'] = url
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res

def getBuildServicesYamlList(host, protocol="http://"):
  try:
    url = '{protocol}{host}/templates/services/yaml'.format(host=host, protocol=protocol)

    apiRequest = requests.get(url, timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    res['json'] = None
  except:
    res = {}
    res['url'] = url
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res

def getBuildServicesMetaData(host, protocol="http://"):
  try:
    url = '{protocol}{host}/config/meta'.format(host=host, protocol=protocol)

    apiRequest = requests.get(url, timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    try:
      res['json'] = apiRequest.json()
    except:
      res['json'] = None
  except:
    res = {}
    res['url'] = url
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res

def getBuildServicesOptionsData(host, protocol="http://"):
  try:
    url = '{protocol}{host}/config/options'.format(host=host, protocol=protocol)

    apiRequest = requests.get(url, timeout = 2)

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    try:
      res['json'] = apiRequest.json()
    except:
      res['json'] = None
  except:
    res = {}
    res['url'] = url
    res['apiRequest'] = None
    res['status'] = -1
    res['text'] = None
    res['json'] = None

  return res
