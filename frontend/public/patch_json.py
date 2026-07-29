import json
import os

frontend_json_path = r"c:\Users\ADMIN\Desktop\Atera\frontend\public\simulated_users.json"
mock_data_path = r"c:\Users\ADMIN\Desktop\Atera\Vietnam-Stock-Market-Regime-Detection-using-Hidden-Markov-Models\ai_core\dashboard_data_prep\dashboard_mock_data.json"

with open(frontend_json_path, 'r', encoding='utf-8') as f:
    simulated_data = json.load(f)

with open(mock_data_path, 'r', encoding='utf-8') as f:
    dashboard_data = json.load(f)

# Thêm hoặc cập nhật key dashboard_data
simulated_data['dashboard_data'] = dashboard_data

with open(frontend_json_path, 'w', encoding='utf-8') as f:
    json.dump(simulated_data, f, ensure_ascii=False, indent=2)

print("Đã cập nhật simulated_users.json thành công!")
