import json

def handler(event, context):
    try:
        # HTTP 요청에서 데이터 추출
        data = event.get('queryStringParameters', {})

        # 입력값 추출 및 검증
        num1 = int(data.get('num1', 0))  # 기본값 0 설정
        num2 = int(data.get('num2', 0))  # 기본값 0 설정

        # 두 수를 더하여 결과 생성
        result = num1 + num2

        # 결과 반환
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"  # CORS 헤더 추가
            },
            "body": json.dumps({"result": result})
        }
    except (ValueError, TypeError) as e:
        # 오류 처리
        return {
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"  # CORS 헤더 추가
            },
            "body": json.dumps({"error": str(e)})
        }
    except Exception as e:
        # 기타 예외 처리
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"  # CORS 헤더 추가
            },
            "body": json.dumps({"error": "Internal server error"})
        }
