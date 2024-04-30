const exploreContext = `Explore Parameters with descriptions
=======================
Structural Parameters
extends (for Explore)	Specifies Explore(s) that will be extended by this Explore
extension (for Explore)	Specifies that the Explore requires extension and cannot itself be exposed to users
explore (for model)	Exposes a view in the Explore menu
fields (for Explore)	Limits the fields available in an Explore from its base view and through the Explore's joins
tags (for Explore)	Specifies text that can be passed to other applications
Display Parameters
description (for Explore)	Adds a description for an Explore that appears to users in the UI
group_label (for Explore)	Creates a group label to use as a heading in the Explore menu
hidden (for Explore)	Hides an Explore from the Explore menu
label (for Explore)	Changes the way an Explore appears in the Explore menu
query (for Explore)	Creates a predefined query for users to select in an Explore's Quick Start menu.
view_label (for Explore)	Specifies how a group of fields from the Explore's base view will be labeled in the field picker
Filter Parameters
access_filter	Adds user-specific filters to an Explore
always_filter	Adds filters a user can change, but not remove, to an Explore
case_sensitive (for Explore)	Specifies whether filters are case-sensitive for an Explore
conditionally_filter	Adds filters to an Explore if a user does not add their own filter from a specific list
sql_always_having	Inserts conditions into the query's HAVING clause that a user cannot change or remove for this Explore
sql_always_where	Inserts conditions into the query's WHERE clause that a user cannot change or remove for this Explore
Join Parameters
always_join	Specifies which joins must always be applied to an Explore
join	Joins an additional view to an Explore. For more information about joins and their parameters, see the Join Parameters reference page.
Query Parameters
cancel_grouping_fields	Cancels the GROUP BY clause when certain fields are chosen in an Explore
from (for Explore)	Specifies the view on which an Explore will be based, and reference the fields of that view by the Explore's name
persist_for (for Explore)	Changes the cache settings for an Explore
persist_with (for Explore)	Specifies the datagroup to use for the Explore's caching policy
required_access_grants (for Explore)	Limits access to the Explore to only users whose user attribute values match the access grants
sql_table_name (for Explore)	Specifies the database table on which an Explore will be based
symmetric_aggregates	Specifies whether symmetric aggregates are enabled for an Explore
view_name (for Explore)	Specifies the view on which an Explore will be based, and references the fields of that view by the view's name
Aggregate Table Parameters
aggregate_table	Creates an aggregate table in order to use aggregate awareness for queries on the Explore. For information on the aggregate_table parameter, see the aggregate_table parameter page. For an overview of aggregate awareness, see the Aggregate awareness documentation page.
query	Defines the query for the aggregate table. For information on query and its subparameters, see the aggregate_table parameter page.
materialization	Defines the persistence strategy for the aggregate table. For information on materialization and its subparameters, see the aggregate_table parameter page.
Refinement Parameters
explore: +explore_name	Adds a plus sign (+) in front of an existing Explore name to add a refinement to the existing Explore. See the LookML refinements documentation page for more information and use cases.
final	Indicates that the current refinement is the final refinement allowed for the Explore. See the LookML refinements documentation page for more information and use cases.

Explore Object with all possible parameters as an examples
=======================

explore: explore_name {
    extension: required
    extends: [explore_name,  explore_name, ...]
    fields: [field_or_set, field_or_set, ...]
    tags: ["string1", "string2", ...]
  
    # DISPLAY PARAMETERS
    description: "Description I want"
    group_label: "Label to use as a heading in the Explore menu"
    hidden: yes | no
    label: "desired label"
    query:  {
        # Desired query parameters (described on the query page)      }
    view_label: "Field picker heading I want for the Explore's fields"
  
    # FILTER PARAMETERS
  
    access_filter: {
      field: fully_scoped_field
      user_attribute: user_attribute_name
    }
  
    # Possibly more access_filter declarations
  
    always_filter: {
      filters: [field_name: "filter expression", field_name: "filter expression", ...]
    }
    case_sensitive: yes | no
    conditionally_filter: {
      filters: [field_name: "filter expression", field_name: "filter expression", ...]
      unless: [field_name, field_name, ...]
    }
    sql_always_having: SQL HAVING condition ;;
    sql_always_where: SQL WHERE condition ;;
  
    # JOIN PARAMETERS
  
    always_join: [view_name, view_name, ...]
    join: view_name {
      # Desired join parameters (described on Join Parameters page)
    }
    # Possibly more join declarations
  
    # QUERY PARAMETERS
  
    cancel_grouping_fields: [fully_scoped_field, fully_scoped_field, ...]
    from: view_name
    persist_for: "N (seconds | minutes | hours)"
    persist_with: datagroup_name
    required_access_grants: [access_grant_name, access_grant_name, ...]
    sql_table_name: table_name ;;
    symmetric_aggregates: yes | no
    view_name: view_name
  
    # AGGREGATE TABLE PARAMETERS
  
    aggregate_table: table_name {
      query:  {
        # Desired query parameters (described on the aggregate_table page)
      }
      materialization:  {
        # Desired materialization parameters (described on the aggregate_table page)
      }
    }
    # Possibly more aggregate_table declarations
  }
`

const joinContext = `Join Parameters with descriptions
=================================
Structural Parameters
join	Joins an additional view to an Explore
Display Parameters
view_label (for join)	Changes the way the join's view name appears in the field picker
Join Parameters
fields (for join)	Determines which fields from a join are brought into an Explore
foreign_key	Specifies a relationship between an Explore and a join using the joined view's primary key
from (for join)	Specifies the view on which a join will be based
outer_only	Specifies whether all queries must use an outer join
relationship	Declares a join as having a one-to-one, many-to-one, one-to-many, or many-to-many relationship
required_joins	Specifies which joins should be applied to an Explore when fields from a certain join are chosen
sql_on	Specifies a relationship between an Explore and a join by writing a SQL ON clause
sql_table_name (for join)	Specifies the database table on which a join will be based
type (for join)	Declares a join as being a left, a full, an inner, or a cross type
Query Parameters
required_access_grants (for join)	Limits access to the join to only users whose user attribute values match the access grants
sql_where	If this join is included in the query, inserts conditions into the query's WHERE clause that a user cannot change or remove for this Explore. (For BigQuery only)

Join object with all possible parameters as examples
=========================================

join: join_name  {

    # DISPLAY PARAMETERS
    view_label: "desired label for the view"

    # JOIN PARAMETERS
    fields: [field_or_set, field_or_set, ...]
    foreign_key: dimension_name
    from: view_name
    outer_only: no | yes
    relationship: many_to_one | many_to_many | one_to_many | one_to_one 
    required_joins: [view_name, view_name, ...]
    sql_on: SQL ON clause ;;
    sql_table_name: table_name ;;
    type: left_outer | cross | full_outer | inner 

    # QUERY PARAMETERS
    required_access_grants: [access_grant_name, access_grant_name, ...]
    sql_where: SQL WHERE condition ;;
  }
`

const viewContext = `View Parameters with descriptions
=================================
Structural Parameters
drill_fields (for view)	Specifies the default list of fields shown when drilling into measures defined in the view
extends (for view)	Specifies view(s) that will be extended by this view
extension (for view)	Specifies that the view requires extension and cannot itself be exposed to users
include	Adds files to a view
test	Creates a data test to verify your model's logic. The project settings include an option to require data tests. When this is enabled for a project, developers on the project must run data tests before deploying their changes to production. This parameter has explore_source and assert subparameters.
set	Defines a set of dimensions and measures to be used in other parameters
view	Creates a view
Display Parameters
label (for view)	Specifies how the view name will appear in the field picker
fields_hidden_by_default	ADDED 21.12 When set to yes, hides all fields in the view by default. Use the hidden: no parameter on a field to display the field.
Filter Parameters
suggestions (for view)	Enables or disables suggestions for all dimensions on this view
Query Parameters
required_access_grants (for view)	Limits access to the view to only users whose user attribute values match the access grants
sql_table_name (for view)	Changes the SQL table on which a view is based
Derived Table Parameters
cluster_keys	Specifies that a PDT be clustered by one or more fields in BigQuery
Support added for cluster_keys on Snowflake
create_process	Specifies an ordered sequence of steps to create a PDT on a database dialect that requires custom DDL commands. This parameter has the subparameter sql_step.
datagroup_trigger	Specifies the datagroup to use for the PDT rebuilding policy
derived_table	Bases a view on a derived table
distribution	Sets the distribution key of a PDT that is built in Redshift or Aster
distribution_style	Sets the distribution style of a PDT that is built in Redshift
explore_source	Defines a native derived table based on an Explore
increment_key	ADDED 21.4 Makes the derived table into an incremental PDT. The increment_key specifies the time increment for which fresh data should be queried and appended to the PDT.
increment_offset	ADDED 21.4 Used in conjunction with the increment_key parameter for incremental PDTs. The increment_offset specifies the number of previous time periods (at the increment key's granularity) that are rebuilt to account for late arriving data.
interval_trigger	ADDED 21.20 The interval_trigger specifies a rebuild schedule for a persistent derived table, in the format "N (seconds | minutes | hours)"
materialized_view	ADDED 21.10 The statement materialized_view: yes creates a materialized view on your database for a derived table.
indexes	Sets the indexes of a PDT built in a traditional database (for example, MySQL, Postgres) or an interleaved sort key in Redshift
partition_keys	Specifies that a PDT be partitioned by one or more fields in Presto, or by a single date/time field in BigQuery
persist_for (for derived_table)	Sets the maximum age of a PDT before it is regenerated
publish_as_db_view	The statement publish_as_db_view: yes creates a stable database view for the PDT to enable querying the table outside of Looker
sortkeys	Sets the sort keys of a PDT that is built in Redshift
sql (for derived_table)	Declares the SQL query for a derived table
sql_create	Defines a SQL CREATE statement to create a PDT on a database dialect that requires custom DDL commands
sql_trigger_value	Specifies the condition that causes a PDT to be regenerated
table_compression	Specifies the table compression to use for a PDT in Amazon Athena
table_format	Specifies the table format to use for a PDT in Amazon Athena
Refinement Parameters
view: +view_name	Adds a plus sign (+) in front of an existing view name to add a refinement to the existing view. See the LookML refinements documentation page for more information and use cases.
final	Indicates that the current refinement is the final refinement allowed for the view. See the LookML refinements documentation page for more information and use cases.

View Object with all possible parameters as an example
======================================

## STRUCTURAL PARAMETERS

include:"filename_or_pattern"
## Possibly more include declarations

test: test_name{
  explore_source: explore_name {
    # Desired subparameters (described on test page)
  }
  assert: assert_statement {
    expression:Looker expression ;;
  }
  # Possibly more assert declarations
}
## Possibly more test declarations

view: view_name {
  extension: required
  extends: [view_name, view_name, ...]

  (dimension | dimension_group | measure | filter):field_name{
    # Desired field parameters (described on Field Parameters page)
  }
  # Possibly more field declarations

  set: set_name{
    fields:[field_or_set, field_or_set, ...]
  }
  # Possibly more set declarations

  drill_fields: [field_or_set, field_or_set, ...]

  # DISPLAY PARAMETERS

  label: "desired label"
  fields_hidden_by_default: yes | no

  # FILTER PARAMETERS

  suggestions: yes | no

  # QUERY PARAMETERS

  required_access_grants: [access_grant_name, access_grant_name, ...]
  sql_table_name: table_name ;;

  # DERIVED TABLE PARAMETERS

  derived_table: {
    cluster_keys: ["column_name", "column_name", ...]
    create_process: {
      sql_step:SQL query ;;
    }
    datagroup_trigger: datagroup_name
    distribution: "column_name"
    distribution_style: all | even
    explore_source: explore_name {
      # Desired subparameters (described on explore_source page)
    }
    increment_key: "column_name"
    increment_offset: N
    indexes: ["column_name", "column_name", ...]
    interval_trigger: "N (seconds | minutes | hours)"
    materialized_view: yes | no
    partition_keys: ["column_name", "column_name", ...]
    persist_for: "N (seconds | minutes | hours)"
    publish_as_db_view: yes | no
    sortkeys: ["column_name","column_name", ...]
    sql: SQL query ;;
    sql_create: {
      SQL query ;;
    }
    sql_trigger_value: SQL query ;;
    table_compression: GZIP | SNAPPY
    table_format: PARQUET | ORC | AVRO | JSON | TEXTFILE
  }
}

## REFINEMENT PARAMETERS
view: +view_name {
  final: yes
}
`

export default { exploreContext, joinContext, viewContext };