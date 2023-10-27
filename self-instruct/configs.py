import json
from opensearchpy import OpenSearch

api_key = ""
intro_file = "./HEAD_EXAMPLE"
seeds_dir = "./seeds"
output_dir = "./raw_outputs"
seed_sections = ["Instruction", "Index", "Fields", "PPL Output"]
threads = 8
per_thread_run = 8

def validate(result):
    client = OpenSearch(
        hosts=[{"host": "localhost", "port": 9200}],
        http_compress=True,
        http_auth=("admin", "admin"),
        use_ssl=True,
        verify_certs=False,
        ssl_assert_hostname=False,
        ssl_show_warn=False,
    )
    try:
        client.transport.perform_request(
            "POST", "/_plugins/_ppl", body={"query": result["PPL Output"]}
        )
        return None
    except Exception as e:
        error = json.loads(e.args[1])["error"]
        return error["type"]
