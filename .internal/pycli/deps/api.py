import requests
import time

def checkApiHealth(host):
  try:
    url = '{host}/health/no-log'.format(host=host)
    apiRequest = requests.get(url)

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

def deleteBuild(host, build):
  try:
    url = '{host}/build/delete/{build}'.format(host=host, build=build)
    apiRequest = requests.post(url)

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

def getTemplateBuildBootstrap(host, build, noFluff = True):
  try:
    url = '{host}/templates/scripts/bootstrap'.format(host=host)
    requestData = {}
    requestData['options'] = {}
    requestData['options']['build'] = build

    if noFluff:
      requestData['options']['nofluff'] = True

    apiRequest = requests.post(url = url, json = requestData)

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

def getPreviousBuildList(host, index = None, limit = None):
  try:
    requestParams = ''
    if not index == None:
      requestParams = requestParams + '/index/{index}'.format(index=index)

    if not limit == None:
      requestParams = requestParams + '/limit/{limit}'.format(limit=limit)

    url = '{host}/build/list{requestParams}'.format(host=host, requestParams=requestParams)

    apiRequest = requests.get(url)

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

def checkWuiState(host):
  try:
    apiRequest = requests.get('{host}/'.format(host=host))

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
