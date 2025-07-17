Here are some steps  for the pipeline to work:
will integrate it with the oipen shift 



i Info → Not all multiplatform-content is present and only the available single-platform image was pushed
         sha256:9becce9e64da749e5fcab730c88445d21fdcf6ce1a416f4e0a42273b09b4ac21 -> sha256:7ee6f8b8067d76f1f1a37c7b05b8d0231db1fdcea5e8105ee11e85f7a7c5a4f8


## First now will do some things to get the volume of the jenkines
```
PS D:\Github_repos\IoT-Insight-Hub> docker run --rm `
>>   -v jenkins_home:/data `
>>   -v "${PWD}\jenkins_backup:/backup" `
>>   busybox sh -c "tar czvf /backup/jenkins_home.tar.gz -C /data ."
```



## Seconed we will do the Yaml file 
```
for the pvc to put the old data from the jenkines 
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: jenkins-data
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```



## Some Links 


- here is the link of 

Jenkines : http://jenkins-rzwz-eng-dev.apps.rm3.7wse.p1.openshiftapps.com/