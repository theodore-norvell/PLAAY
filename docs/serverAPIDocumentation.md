# Server API documentation

### GET /

Create a new program with a random name.  No login required.  Initially the user is "guest".

### GET /file/&lt;path&gt;

The same as GET / followed by a fetch of the path.

###  POST /login

Parameters

* email Must look like an email
* password Must not be empty

If successful, the user is logged in and the status code is 200

###  POST /logout

The user must be logged in. Otherwise status 401.

If successful, the user is logged in and the status code is 200.

### POST /fetch

Parameters
* path The absolute path of the file
* version (optional): Either a number or the word "latest". (default "latest") or the word "autosave"

The user must be logged in. Otherwise status 401.

The file must exist.  Otherwise status 404.

If version a number, the version must exist.  Otherwise status 404.

The user must have sufficient permission. Otherwise status 403.

If successful, the status is 200. For regular files the contents are returned as a string.  For directories, the contents are encoded as a JSON object.


### POST /create

Parameters

* type: One of "regular", "link", or "directory" (default: "ordinary")
* contents: A string. (Default empty)
* permissions: The permissions as an octal number.
* type
* properties: A JSON encoded properties object.


The parent directory must not exist.  Otherwise status 404.

The file must not exist.  Otherwise status 404.

The user must have sufficient permission on the parent directory. Otherwise status 403.

For regular files: A new file is created. Its version number will be 0.
For links: The contents must be a valid path.
For directories: The contents parameter is ignored, the directory is created empty other than the "." and ".." pseudo entries.

If successful, the status is 200.

### POST /update

Parameters

* path The full path name of the file.
* version: Either a number or the word "latest" or the word "new" or the word "autosave".
* contents: A string


The user must be logged in. Otherwise status 401.

The file must exist.  Otherwise status 404.

The file must be a regular file or a link. Otherwise status 403.

If version is a number, the version must exist.  Otherwise status 404.

The user must have sufficient permission. Otherwise status 403.

For a link, the contents must be a path.

Either an existing version of the file is overwritten. Or a new version is created.  In the case of autosave, either could be the case.

If successful, the status is 200.

### POST /delete

Parameters

* path The full path name of the file.
* version: Either a number or the word "latest" or the word "all". (default "all")
The file must exist.  Otherwise status 404.

The file must be a regular file, a link, or an empty directory. Otherwise status 403.

If version a number, the version must exist.  Otherwise status 404.

The user must have sufficient permission. Otherwise status 403.

For regular files, if this is the only version (not counting autosaved versions) or the version is "all", the file is unlinked from the parent directory. In case this is the last link, the file is destroyed and can not be recovered.

If successful, the status is 200.

### POST /trash

Parameters

* path The full path name of the file.

The file must exist.  Otherwise status 404.

The user must have sufficient permission. Otherwise status 403.

The file is moved to the user's trash directory.  If there is already a file in the trash of the same name, that file is first moved to new name or deleted.  Files in the trash folder are subject to deletion at any time.

If successful, the status is 200.