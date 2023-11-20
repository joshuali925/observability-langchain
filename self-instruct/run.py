from getClaudeDataTable import requestClaude
from parseRawCompletion import addToSeeds, parseRawCompletions
from configs import seeds_dir, seed_sections, output_dir, validate_alerts


if __name__ == "__main__":
    requestClaude()
    parseRawCompletions(output_dir, seed_sections, validate_alerts)
    # addToSeeds(seeds_dir, seed_sections)
