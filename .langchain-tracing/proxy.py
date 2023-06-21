#!/usr/bin/env python3
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
from socketserver import ThreadingMixIn

import requests


target = os.getenv("TARGET", "localhost:8000")
host = os.getenv("OS_HOST", "http://localhost:9200")
auth = (os.getenv("OS_USER", ""), os.getenv("OS_PASS", ""))


def init_index():
    try:
        requests.put(
            f"{host}/langchain",
            auth=auth,
            verify=False,
        )
        f = open("mappings.json")
        data = json.load(f)
        f.close()
        requests.post(
            f"{host}/langchain/_mapping",
            json=data,
            auth=auth,
            verify=False,
        )
    except Exception as e:
        print(e)


def post(bstr):
    data = json.loads(bstr.decode())
    requests.post(
        f"{host}/langchain/_doc",
        json=data,
        auth=auth,
        verify=False,
    )


session_id = ""


class ProxyHTTPRequestHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.0"

    def do_HEAD(self):
        self.do_GET(body=False)
        return

    def do_GET(self, body=True):
        global session_id
        sent = False
        try:
            url = "http://{}{}".format(target, self.path)
            req_header = self.parse_headers()

            print("GET url:", url)
            print("req_header:", req_header)
            session_id = self.path.removeprefix("/sessions?name=")
            resp = requests.get(
                url, headers=req_header | {"Host": target}, verify=False
            )
            sent = True

            self.send_response(resp.status_code)
            self.send_resp_headers(resp)
            msg = resp.text
            if body:
                self.wfile.write(msg.encode(encoding="UTF-8", errors="strict"))
            return
        finally:
            if not sent:
                self.send_error(404, "error trying to proxy")

    def do_POST(self, body=True):
        global session_id
        sent = False
        try:
            url = "http://{}{}".format(target, self.path)
            print("POST url:", url)
            content_len = int(self.headers.get("content-length", 0))
            post_body = self.rfile.read(content_len)
            post_body_with_session = post_body.replace(
                b',"session_id":1,', str.encode(f',"session_id":"{session_id}",')
            )
            post(post_body_with_session)
            req_header = self.parse_headers()

            resp = requests.post(
                url,
                data=post_body,
                headers=req_header | {"Host": target},
                verify=False,
            )
            content_with_session = resp.content.replace(
                b',"session_id":1,', str.encode(f',"session_id":"{session_id}",')
            )
            post(content_with_session)
            sent = True

            self.send_response(resp.status_code)
            self.send_resp_headers(resp)
            if body:
                self.wfile.write(resp.content)
            return
        finally:
            if not sent:
                self.send_error(404, "error trying to proxy")

    def parse_headers(self):
        req_header = {}
        for line in self.headers:
            line_parts = [o.strip() for o in line.split(":", 1)]
            if len(line_parts) == 2:
                req_header[line_parts[0]] = line_parts[1]
        return req_header

    def send_resp_headers(self, resp):
        respheaders = resp.headers
        print("Response Header")
        for key in respheaders:
            if key not in [
                "Content-Encoding",
                "Transfer-Encoding",
                "content-encoding",
                "transfer-encoding",
                "content-length",
                "Content-Length",
            ]:
                print(key, respheaders[key])
                self.send_header(key, respheaders[key])
        self.send_header("Content-Length", str(len(resp.content)))
        self.end_headers()


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in a separate thread."""


def main():
    init_index()
    print("http server is starting on {} port {}...".format("127.0.0.1", 1984))
    server_address = ("127.0.0.1", 1984)
    httpd = ThreadedHTTPServer(server_address, ProxyHTTPRequestHandler)
    print("http server is running as reverse proxy")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
