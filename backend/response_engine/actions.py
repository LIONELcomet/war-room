import logging
from datetime import datetime

class ResponseEngine:
    def __init__(self):
        # We store the state of the network/components here to help 
        # the frontend visualize isolates nodes
        self.system_state = {
            "isolated_ips": [],
            "disabled_users": [],
            "killed_pids": [],
            "isolated_servers": []
        }

    def execute_action(self, action_type: str, target: str):
        """Executes a containment action based on action_type."""
        
        if action_type == "block_ip":
            return self.block_ip(target)
        elif action_type == "disable_user":
            return self.disable_user(target)
        elif action_type == "kill_process":
            return self.kill_process(target)
        elif action_type == "isolate_server":
            return self.isolate_server(target)
        else:
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ResponseEngine -> Unknown action type: {action_type}")
            return {"status": "failed", "reason": "unknown action"}

    def block_ip(self, ip: str):
        if ip not in self.system_state["isolated_ips"]:
            self.system_state["isolated_ips"].append(ip)
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ResponseEngine -> blocking IP {ip}")
        return {"action": "block_ip", "target": ip, "status": "success"}

    def disable_user(self, username: str):
        if username not in self.system_state["disabled_users"]:
            self.system_state["disabled_users"].append(username)
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ResponseEngine -> disabling user {username}")
        return {"action": "disable_user", "target": username, "status": "success"}

    def kill_process(self, process_info: str):
        if process_info not in self.system_state["killed_pids"]:
            self.system_state["killed_pids"].append(process_info)
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ResponseEngine -> killing process {process_info}")
        return {"action": "kill_process", "target": process_info, "status": "success"}

    def isolate_server(self, server_id: str):
        if server_id not in self.system_state["isolated_servers"]:
            self.system_state["isolated_servers"].append(server_id)
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] ResponseEngine -> isolating server {server_id}")
        return {"action": "isolate_server", "target": server_id, "status": "success"}

    def get_state(self):
        return self.system_state

# Global instance
engine = ResponseEngine()
