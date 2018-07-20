ACCOUNT_ID = 387429770668
ROLE_NAME =  lambda-s3-image-ops 
FUNCTION_NAME = SceneVRResizeImage
REGION = us-east-1
TIMEOUT = 15
MEMORY_SIZE = 512
ZIPFILE_NAME = image_resize.zip
HANDLER = handler.handle_resize

clean_pyc :
	find . -name "*.pyc" -exec rm '{}' \;

install_deps :
	pip install -r requirements.txt -t .

build : install_deps clean_pyc
	zip $(ZIPFILE_NAME) -r *

create : build
	aws lambda create-function --region $(REGION) --function-name $(FUNCTION_NAME) --zip-file fileb://$(ZIPFILE_NAME) --role arn:aws:iam::$(ACCOUNT_ID):role/$(ROLE_NAME)  --handler $(HANDLER) --runtime python2.7 --timeout $(TIMEOUT) --memory-size $(MEMORY_SIZE)

update : build
	aws lambda update-function-code --region $(REGION) --function-name $(FUNCTION_NAME) --zip-file fileb://$(ZIPFILE_NAME) --publish
