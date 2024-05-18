# functions/calculate.py

def handler(event, context):
    # HTTP 요청에서 데이터 추출
    data = event['queryStringParameters']
    
    # 입력값 추출
    num1 = int(data['num1'])
    num2 = int(data['num2'])
    
    # 두 수를 더하여 결과 생성
    result = num1 + num2
    
    # 결과 반환
    return {
        "statusCode": 200,
        "body": str(result)
    }
