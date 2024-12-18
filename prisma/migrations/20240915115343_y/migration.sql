-- CreateTable
CREATE TABLE "Subject" (
    "subjectId" SERIAL NOT NULL,
    "subjectName" TEXT NOT NULL,
    "subDescription" TEXT NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("subjectId")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "assignmentId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "codeSnippet" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignmentId")
);

-- CreateTable
CREATE TABLE "User" (
    "userId" SERIAL NOT NULL,
    "fname" TEXT,
    "lname" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "SubjectUser" (
    "subjectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_SubjectUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Subject_subjectName_key" ON "Subject"("subjectName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectUser_subjectId_key" ON "SubjectUser"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectUser_userId_key" ON "SubjectUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_SubjectUser_AB_unique" ON "_SubjectUser"("A", "B");

-- CreateIndex
CREATE INDEX "_SubjectUser_B_index" ON "_SubjectUser"("B");

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectUser" ADD CONSTRAINT "SubjectUser_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("subjectId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectUser" ADD CONSTRAINT "SubjectUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectUser" ADD CONSTRAINT "_SubjectUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("subjectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectUser" ADD CONSTRAINT "_SubjectUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
