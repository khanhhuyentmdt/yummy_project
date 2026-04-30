#!/usr/bin/env python
"""
Test script để kiểm tra API tạo nhân viên
Chạy: python test_employee_api.py
"""
import requests
import json

BASE_URL = "http://127.0.0.1:2344/api"

# Bước 1: Login để lấy token (nếu cần)
# Thay đổi username/password theo tài khoản test của bạn
def get_auth_token():
    """Lấy authentication token"""
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json={
            "username": "admin",  # Thay đổi theo tài khoản của bạn
            "password": "admin123"
        })
        if response.status_code == 200:
            return response.json().get('token')
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

# Bước 2: Test tạo nhân viên
def test_create_employee(token=None):
    """Test API tạo nhân viên"""
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    # Dữ liệu test - chỉ các trường bắt buộc
    data = {
        'full_name': 'Nguyễn Văn Test',
        'phone': f'090{str(hash("test"))[-7:]}',  # Số điện thoại random
        'role': 'Nhân viên bếp',
        'shift': 'Ca sáng',
        'has_salary_info': 'false',
        'benefits_ids': '[]',
        'status': 'working',
    }
    
    print("\n📤 Sending POST request to create employee...")
    print(f"Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/employees/",
            data=data,
            headers=headers
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Employee created successfully!")
            result = response.json()
            print(f"Employee Code: {result.get('code')}")
            print(f"Employee Name: {result.get('full_name')}")
            print(f"Employee ID: {result.get('id')}")
            return True
        else:
            print(f"❌ Failed to create employee")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request error: {e}")
        return False

# Bước 3: Test với lương thưởng
def test_create_employee_with_salary(token=None):
    """Test API tạo nhân viên có lương thưởng"""
    headers = {}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    data = {
        'full_name': 'Trần Thị Test Salary',
        'phone': f'091{str(hash("salary"))[-7:]}',
        'role': 'Nhân viên bếp',
        'shift': 'Ca chiều',
        'has_salary_info': 'true',
        'salary_type_id': '1',  # Giả sử có salary type với ID=1
        'salary_amount': '10000000',
        'benefits_ids': '[1, 2]',  # Giả sử có benefits với ID 1, 2
        'status': 'working',
    }
    
    print("\n📤 Sending POST request to create employee with salary...")
    print(f"Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/employees/",
            data=data,
            headers=headers
        )
        
        print(f"\n📥 Response Status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ Employee with salary created successfully!")
            result = response.json()
            print(f"Employee Code: {result.get('code')}")
            print(f"Employee Name: {result.get('full_name')}")
            print(f"Salary Amount: {result.get('salary_amount')}")
            return True
        else:
            print(f"❌ Failed to create employee")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Request error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 TESTING EMPLOYEE API")
    print("=" * 60)
    
    # Lấy token (comment out nếu API không cần authentication)
    # token = get_auth_token()
    token = None  # Nếu API không cần auth
    
    # Test 1: Tạo nhân viên cơ bản
    print("\n" + "=" * 60)
    print("TEST 1: Create basic employee")
    print("=" * 60)
    test_create_employee(token)
    
    # Test 2: Tạo nhân viên có lương thưởng
    print("\n" + "=" * 60)
    print("TEST 2: Create employee with salary")
    print("=" * 60)
    test_create_employee_with_salary(token)
    
    print("\n" + "=" * 60)
    print("✅ Testing completed!")
    print("=" * 60)
