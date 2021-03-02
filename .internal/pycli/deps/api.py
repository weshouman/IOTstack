import requests
import time

def checkApiHealth(host):
  try:
    apiRequest = requests.get('{host}/health/no-log'.format(host=host))

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    res['json'] = apiRequest.json()
  except:
    res = {}
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

    apiRequest = requests.get('{host}/build/list{requestParams}'.format(host=host, requestParams=requestParams))

    res = {}
    res['apiRequest'] = apiRequest
    res['status'] = apiRequest.status_code
    res['text'] = apiRequest.text
    res['json'] = apiRequest.json()
  except:
    res = {}
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
