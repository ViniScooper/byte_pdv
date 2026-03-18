import { getPool } from './src/utils/db.js';

async function run() {
  try {
    const pool = await getPool();
    console.log('Connected to DB');

    // Remove UNIQUE CONSTRAINT on googleId
    await pool.request().query(`
      DECLARE @ConstraintName NVARCHAR(128)
      SELECT @ConstraintName = kc.name
      FROM sys.key_constraints kc
      JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
      JOIN sys.columns c ON ic.object_id = c.object_id AND c.column_id = ic.column_id
      WHERE kc.parent_object_id = OBJECT_ID('User') AND c.name = 'googleId' AND kc.type = 'UQ'

      IF @ConstraintName IS NOT NULL
      BEGIN
          DECLARE @SQL NVARCHAR(MAX) = 'ALTER TABLE [User] DROP CONSTRAINT ' + @ConstraintName
          EXEC sp_executesql @SQL
          PRINT 'Dropped constraint: ' + @ConstraintName
      END
      ELSE
      BEGIN
          PRINT 'No unique constraint found on googleId'
      END
    `);
    
    // There is also a unique index/constraint on pictureUrl. We should drop it as well to be safe since it is also null.
    await pool.request().query(`
      DECLARE @ConstraintName2 NVARCHAR(128)
      SELECT @ConstraintName2 = kc.name
      FROM sys.key_constraints kc
      JOIN sys.index_columns ic ON kc.parent_object_id = ic.object_id AND kc.unique_index_id = ic.index_id
      JOIN sys.columns c ON ic.object_id = c.object_id AND c.column_id = ic.column_id
      WHERE kc.parent_object_id = OBJECT_ID('User') AND c.name = 'pictureUrl' AND kc.type = 'UQ'

      IF @ConstraintName2 IS NOT NULL
      BEGIN
          DECLARE @SQL2 NVARCHAR(MAX) = 'ALTER TABLE [User] DROP CONSTRAINT ' + @ConstraintName2
          EXEC sp_executesql @SQL2
          PRINT 'Dropped constraint: ' + @ConstraintName2
      END
      ELSE
      BEGIN
          PRINT 'No unique constraint found on pictureUrl'
      END
    `);

    // Let's also check if they are just regular unique indexes (Prisma sometimes uses CREATE UNIQUE INDEX)
    await pool.request().query(`
      DECLARE @IndexName NVARCHAR(128)
      SELECT @IndexName = i.name
      FROM sys.indexes i
      JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      JOIN sys.columns c ON ic.object_id = c.object_id AND c.column_id = ic.column_id
      WHERE i.object_id = OBJECT_ID('User') AND c.name = 'googleId' AND i.is_unique = 1 AND i.is_unique_constraint = 0

      IF @IndexName IS NOT NULL
      BEGIN
          DECLARE @SQL3 NVARCHAR(MAX) = 'DROP INDEX ' + @IndexName + ' ON [User]'
          EXEC sp_executesql @SQL3
          PRINT 'Dropped index: ' + @IndexName
      END
    `);
    
    await pool.request().query(`
      DECLARE @IndexName2 NVARCHAR(128)
      SELECT @IndexName2 = i.name
      FROM sys.indexes i
      JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      JOIN sys.columns c ON ic.object_id = c.object_id AND c.column_id = ic.column_id
      WHERE i.object_id = OBJECT_ID('User') AND c.name = 'pictureUrl' AND i.is_unique = 1 AND i.is_unique_constraint = 0

      IF @IndexName2 IS NOT NULL
      BEGIN
          DECLARE @SQL4 NVARCHAR(MAX) = 'DROP INDEX ' + @IndexName2 + ' ON [User]'
          EXEC sp_executesql @SQL4
          PRINT 'Dropped index: ' + @IndexName2
      END
    `);

    console.log('Successfully dropped unique constraints/indexes on googleId and pictureUrl.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

run();
