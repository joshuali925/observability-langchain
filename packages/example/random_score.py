import json
import sys
import random

def main():
    if len(sys.argv) >= 3:
        output = sys.argv[1]
        context = json.loads(sys.argv[2])
    else:
        raise ValueError("Model output and context are expected.")
    results = {}
    results["output"] = output
    results["context"] = context
    results["score"] = random.random()
    return json.dumps(results)

print(main())