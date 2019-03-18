# Database for PLAAY

## The current situation

Programs collection

```typescript
const programSchema = new mongoose.Schema({
    name: String,
    content: String,
    user: String,
    version: Number,
    private: Boolean,
    identifier: {type: String, unique: true}
}, {timestamps: true});
```

Also Mongo  throws in _id (an ObjectID), updatedAt, and createdAt (both Dates). 

Users collection

```typescript
const userSchema = new mongoose.Schema({
    email: {type: String, unique: true},
    password: String,
    passwordResetToken: String, // Never used?
    passwordResetExpires: String, // Never used?
    facebook: String, // Never used?
    twitter: String,  // Never used?
    google: String, // Never used?
    tokens: Array, // Never used?
    profile: { // Never Used?
        name: String,
        gender: String,
        location: String,
        website: String,
        picture: String
    }
}, {timestamps: true});
```

In addition there is a `sessions` collection which is used by mongo-express.

## The desired situation 

There is a file system is a collection of files

Each file

* An ID (unique). (Essentially inode.)
* An owner. (The ID of the owner.)
* A set of permissions (Unix style.)
* Times for modification, change of contents, and access.
* A type, which may be regular, directory, or link.
* A list of named properties. (One of these is "subtype", which is "plaayProgram" in the case of Plaay programs.)


Each directory has a list of name/file id pairs (unique by name).  A directory may also have a list of shadow directories.

Each datafile will consist of

* A reference count. (How many directories is it in.)

Each version will have a version number (starting from 0 with no duplicates), contents, and optionally a URL.  Version -1 is used for autosaving. The contents is simply a string of bytes.