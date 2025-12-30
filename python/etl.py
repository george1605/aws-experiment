import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from recipe_transforms import *
from awsgluedq.transforms import EvaluateDataQuality
from awsglue.dynamicframe import DynamicFrame

def applyRecipe_node1767118945949(inputFrame, glueContext, transformation_ctx):
    frame = inputFrame.toDF()
    gc = glueContext
    df0 = frame
    return DynamicFrame.fromDF(df0, gc, transformation_ctx)

args = getResolvedOptions(sys.argv, ['JOB_NAME'])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args['JOB_NAME'], args)

AmazonS3_node1767114176974 = glueContext.create_dynamic_frame.from_options(format_options={"quoteChar": "\"", "withHeader": True, "separator": ","}, connection_type="s3", format="csv", connection_options={"paths": ["s3://s3-bckt-1605/data.csv"], "recurse": True}, transformation_ctx="AmazonS3_node1767114176974")

DropFields_node1767114255214 = DropFields.apply(frame=AmazonS3_node1767114176974, paths=["response_id"], transformation_ctx="DropFields_node1767114255214")

# Adding configuration for certain Data Preparation recipe steps to run properly
spark.conf.set("spark.sql.legacy.timeParserPolicy", "LEGACY")
# Recipe name: DataPreparationRecipe_node1767118945949
DataPreparationRecipe_node1767118945949 = applyRecipe_node1767118945949(
    inputFrame=AmazonS3_node1767114176974,
    glueContext=glueContext,
    transformation_ctx="DataPreparationRecipe_node1767118945949")

DropFields_node1767114255857 = DropFields.apply(frame=DropFields_node1767114255214, paths=[], transformation_ctx="DropFields_node1767114255857")

EvaluateDataQuality_node1767114305297_ruleset = """
    # Example rules: Completeness "colA" between 0.4 and 0.8, ColumnCount > 10
    Rules = [
        CustomSql "select avg(satisfaction_score) from primary" between 3.5 and 5
    ]
    Analyzers = [
    Completeness of AllColumns
    ]
"""

EvaluateDataQuality_node1767114305297 = EvaluateDataQuality().process_rows(frame=DropFields_node1767114255857, ruleset=EvaluateDataQuality_node1767114305297_ruleset, publishing_options={"dataQualityEvaluationContext": "EvaluateDataQuality_node1767114305297", "enableDataQualityCloudWatchMetrics": True, "enableDataQualityResultsPublishing": True}, additional_options={"performanceTuning.caching":"CACHE_NOTHING","observations.scope":"ALL"})

job.commit()