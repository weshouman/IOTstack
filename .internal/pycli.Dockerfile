FROM python:3

WORKDIR /usr/iotstack_pycli

COPY ./.internal/pycli ./
RUN pip install --no-cache-dir -r requirements.txt

CMD [ "python", "./entry.py" ]
