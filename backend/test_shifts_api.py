import requests

# Test shifts API
response = requests.get('http://127.0.0.1:2344/api/shifts/')
print("Status:", response.status_code)

if response.status_code == 200:
    data = response.json()
    print(f"\nTotal shifts: {data.get('total', 0)}")
    print("\nShifts:")
    for shift in data.get('shifts', []):
        print(f"  {shift['code']} - {shift['name']}")
        print(f"    Time: {shift['start_time']} - {shift['end_time']}")
        print(f"    Total hours: {shift.get('total_hours_display', shift.get('total_hours', 'N/A'))}")
        print(f"    Breaks: {len(shift.get('breaks', []))}")
        print()
else:
    print("Error:", response.text)
