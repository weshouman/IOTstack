#!/usr/bin/env python3

import blessed
import yaml
import ruamel.yaml
import subprocess
import os

hostUser = os.getenv('HOSTUSER')

print('blessed Version:', blessed.__version__)
print('ruamel.yaml Version:', ruamel.yaml.__version__)
print('PyYAML Version:', yaml.__version__)
print('')
print('hostUser: ', hostUser)

print('')
testInput = print('Remote test: ')
res1 = subprocess.check_output("""
ssh -t -o StrictHostKeychecking=no {hostUser}@host.docker.internal 'touch ~/tat.file'
""".format(hostUser=hostUser), stderr=subprocess.PIPE, shell=True)

res2 = subprocess.check_output("""
ssh -t -o StrictHostKeychecking=no {hostUser}@host.docker.internal 'echo "hi" >> ~/tat.file'
""".format(hostUser=hostUser), stderr=subprocess.PIPE, shell=True)

res3 = subprocess.check_output("""
ssh -t -o StrictHostKeychecking=no {hostUser}@host.docker.internal 'cat ~/tat.file'
""".format(hostUser=hostUser), stderr=subprocess.PIPE, shell=True)

res4 = subprocess.check_output("""
ssh -t -o StrictHostKeychecking=no {hostUser}@host.docker.internal 'rm ~/tat.file'
""".format(hostUser=hostUser), stderr=subprocess.PIPE, shell=True)

testInput = print(res3.decode('ascii'))
print('')

testInput = input('Enter input: ')
print('Input you entered', testInput)
