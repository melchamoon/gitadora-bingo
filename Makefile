repomix:
	mkdir -p tmp/repomix
	npx repomix --output tmp/repomix/repomix-output.txt --ignore "**/*.png,**/*.jpg,**/*.jpeg,**/*.gif,src/data/**,tmp/**"

ci:
	npm run build
