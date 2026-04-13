---
name: go-dev
version: "1.1.0"
description: Go development workflow — build, test, module management
prereq: references/SETUP.md
dependencies:
  skills: []
---

# Go Dev Skill

## Build & Verify

```bash
# Build (verify compilation)
go build -o /dev/null .

# Build with output
go build -o <binary> .

# Run tests
go test ./...

# Run specific test
go test -run TestName ./package/

# Vet (static analysis)
go vet ./...
```

## Module Management

```bash
# Tidy dependencies
go mod tidy

# Add dependency
go get github.com/example/package@latest

# Check module
go mod verify
```

## Code Style

- **Package naming**: lowercase, single word when possible (`commander`, `mcp`, `llm`)
- **File naming**: lowercase with underscores (`my_file.go`)
- **Error handling**: Always check errors, wrap with context using `fmt.Errorf("context: %w", err)`
- **Exports**: Only export what's needed by other packages
- **Comments**: Exported functions must have doc comments

## Project Structure Conventions

```
project/
├── main.go              # Entry point
├── go.mod
├── go.sum
├── package1/            # Feature packages
│   ├── types.go         # Types and interfaces
│   ├── logic.go         # Core logic
│   └── helpers.go       # Utilities
└── package2/
```

## Debugging

```bash
# Build with debug symbols
go build -gcflags="all=-N -l" .

# Print to stderr for debugging
fmt.Fprintf(os.Stderr, "debug: %v\n", value)
```

## Common Patterns

### Error wrapping
```go
if err != nil {
    return fmt.Errorf("operation failed: %w", err)
}
```

### File operations
```go
data, err := os.ReadFile(path)
if err != nil {
    return err
}
err = os.WriteFile(path, data, 0644)
```

### Command execution
```go
cmd := exec.Command("program", "arg1", "arg2")
cmd.Dir = workDir
out, err := cmd.CombinedOutput()
```

## Rules

- **Always run `go build`** before committing to verify compilation
- **Go must be in PATH** — see `references/SETUP.md` for installation and PATH setup
- **No `init()` functions** unless absolutely necessary
- **Keep packages focused** — one responsibility per package
