import os
import subprocess

hostUser = os.getenv('HOSTUSER')
iotstackPwd = os.getenv('IOTSTACKPWD')
hostAddress = os.getenv('HOSTSSH_ADDR')
hostPort = os.getenv('HOSTSSH_PORT')

def getCommandString(command, iotstackPwd=iotstackPwd, hostUser=hostUser, hostAddress=hostAddress):
  return "ssh -t -o StrictHostKeychecking=no {hostUser}@{hostAddress} -p {hostPort} 'cd {iotstackPwd} && {command}' 2> /dev/null".format(
    hostUser=hostUser,
    iotstackPwd=iotstackPwd,
    hostAddress=hostAddress,
    hostPort=hostPort,
    command=command
  )

def execSilent(command):
  print(1111, getCommandString(command))
  execRes = subprocess.check_output(getCommandString(command), stderr=subprocess.PIPE, shell=True)
  print(2222, execRes)
  return execRes.decode('ascii').strip()

def execInteractive(command):
  return subprocess.call(getCommandString(command), shell=True)
