repomix:
	mkdir -p tmp/repomix
	npx repomix --output tmp/repomix/repomix-output.txt --ignore "css/tom-select.min.css,js/tom-select.base.js"

ci:
	@echo "No CI checks defined yet."
