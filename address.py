import numpy as np
import pandas as pd
from urllib.request import urlopen
from urllib import parse
from urllib.request import Request
from urllib.error import HTTPError
from bs4 import BeautifulSoup
import json

# naver api
client_id = 'o0gtk2mumz'      # 본인이 할당받은 ID 입력
client_pw = 'IAuDyfbi0dImigMC59KM4qF2uDia12SyQw6LTrsc'  # 본인이 할당받은 Secret 입력

api_url = 'https://naveropenapi.apigw.ntruss.com/map-geocode/v3/geocode?query='

# 주소 목록 파일 (.xlsx)
data = pd.read_excel('list_of_address.xlsx', usecols='B, C', names=['구주소', '도로명주소'])

# 네이버 지도 API 이용해서 위경도 찾기
geo_coordi = []  # geographic coordinates
for add in data['도로명주소']:
    add_urlenc = parse.quote(add)  # 주소를 URL에서 사용할 수 있도록 URL Encoding
    url = api_url + add_urlenc
    request = Request(url)
    request.add_header('X-NCP-APIGW-API-KEY-ID', client_id)
    request.add_header('X-NCP-APIGW-API-KEY', client_pw)
    try:
        response = urlopen(request)
    except HTTPError as e:
        print('HTTP Error!')
        latitude = None
        longitude = None
    else:
        rescode = response.getcode()  # 정상이면 200 리턴
        if rescode == 200:
            response_body = response.read().decode('utf-8')
            response_body = json.loads(response_body)  # json
            if 'addresses' in response_body:
                latitude = response_body['addresses'][0]['y']
                longitude = response_body['addresses'][0]['x']
                print("Success!")
            else:
                print("'result' not exist!")
                latitude = None
                longitude = None
        else:
            print('Response error code : %d' % rescode)
            latitude = None
            longitude = None

    geo_coordi.append([latitude, longitude])

np_geo_coordi = np.array(geo_coordi)
pd_geo_coordi = pd.DataFrame({"구주소": data['구주소'].values,
                              "도로명": data['도로명주소'].values,
                              "위도": np_geo_coordi[:, 0],
                              "경도": np_geo_coordi[:, 1]})

# save result
writer = pd.ExcelWriter('output_v2.xlsx')
pd_geo_coordi.to_excel(writer, sheet_name='Sheet1')
writer.save()