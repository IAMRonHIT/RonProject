# Grok-3-Mini Integration with Tool Calling Research

This document compiles research on implementing Grok-3-Mini with tool calling capabilities for FDA Drug Label API and PubMed API integration.

## Table of Contents

1. [Grok-3-Mini API](#grok-3-mini-api)
2. [FDA Drug Label API](#fda-drug-label-api)
3. [PubMed API / E-utilities](#pubmed-api--e-utilities)
4. [Integration Architecture](#integration-architecture)

## Grok-3-Mini API

Based on research from the unofficial [Grok3 API client](https://github.com/mem0ai/grok3-api):

### Authentication & Setup

The unofficial Grok-3-Mini API client requires authentication cookies extracted from a browser session:

```python
from grok_client import GrokClient

# Cookie values obtained from browser session
cookies = {
    "x-anonuserid": "ffdd32e1",
    "x-challenge": "TkC4D..",
    "x-signature": "fJ0...",
    "sso": "ey...",
    "sso-rw": "ey..."
}

# Initialize the client
client = GrokClient(cookies)

# Send a message and get response
response = client.send_message("write a poem")
print(response)
```

### Installation

```bash
git clone https://github.com/mem0ai/grok3-api.git
cd grok3-api
virtualenv pyenv
source pyenv/bin/activate
pip install .
```

### Key Notes

- The API appears to be a reverse-engineered client, not an official X.AI product
- It's unclear if tool calling is officially supported at this time
- This approach requires extracting cookies from a browser session
- Further browser-based research needed to identify official X.AI documentation for tool calling

## FDA Drug Label API

The OpenFDA Drug Label API provides programmatic access to FDA-approved prescription and over-the-counter drug labeling data.

### Basic Overview

- RESTful API serving JSON data through Elasticsearch queries
- Access to drug identification, warnings, usage guidelines, and manufacturer details
- No authentication required for basic usage

### FDA Drug Label API Key Features

- Field-specific searches (boxed_warning, indications_and_usage)
- Date range filtering
- Result counting/aggregation
- Batch retrieval with pagination
- Support for exact phrase matching and free-text search

### FDA Drug Label API Implementation

Basic endpoint:

```text
https://api.fda.gov/drug/label.json
```

For production use, obtain a free API key from [FDA portal](https://open.fda.gov/apis/authentication/) and append it to requests:

```text
&api_key=YOUR_KEY
```

### Usage Examples

**1. Retrieve labels with boxed warnings:**

```python
import requests
response = requests.get(
    "https://api.fda.gov/drug/label.json",
    params={
        "search": '_exists_:boxed_warning',
        "limit": 5
    }
)
print(response.json()['results'])
```

**2. Search OTC drugs for headache treatments:**

```bash
curl "https://api.fda.gov/drug/label.json?search=openfda.product_type.exact:\"HUMAN+OTC+DRUG\"+AND+indications_and_usage:\"headache\""
```

**3. Count manufacturers by product type:**

```text
https://api.fda.gov/drug/label.json?count=openfda.manufacturer_name.exact
```

### Best Practices

1. Add 1-second delays between requests
2. Use `.exact` modifiers for precise field matching
3. Apply temporal filtering when appropriate
4. Check meta.results.total before processing

### Common Pitfalls (FDA Drug Label API)

- Some labels have incomplete data (6% lack `active_ingredient` field)
- Date format must be ISO 8601 (YYYY-MM-DD) with URL encoding
- Always specify `fields` parameter to limit response size
- Consider case sensitivity in search terms

### Documentation

- [API Basics](https://open.fda.gov/apis/)
- [Drug Labeling Endpoint Guide](https://open.fda.gov/apis/drug/label/)
- [Searchable Fields](https://open.fda.gov/apis/drug/label/searchable-fields/)

## PubMed API / E-utilities

The PubMed API, part of NCBI's Entrez Programming Utilities (E-utilities), provides programmatic access to biomedical literature through nine server-side tools.

### PubMed API Basic Overview

- RESTful API for accessing PubMed's 35+ million citations
- Facilitates searching, record fetching, and cross-database linking
- Provides stable access in compliance with NCBI's terms

### Key Components

- `esearch`: Retrieve PMIDs from search queries
- `efetch`: Get full record data (XML, MEDLINE, JSON formats)
- `esummary`: Obtain citation summaries
- `elink`: Find related articles across databases

### PubMed API Key Features

- Multiple output formats: XML (default), JSON, MEDLINE
- Batch processing: Retrieve up to 10,000 records per request
- Cross-linking: Find related articles in PubMed or other NCBI databases
- Filtering: Use MeSH terms, publication dates, and article types
- Updated in 2022 to align with current PubMed web interface

### Setup

No installation required – access via HTTP requests. For heavy usage:

1. Obtain API key from [NCBI Account Settings](https://www.ncbi.nlm.nih.gov/account/settings/)
2. Include `&api_key=YOUR_KEY` in requests to increase rate limits (10 requests/sec vs 3/sec without)
3. Use `tool` and `email` parameters for troubleshooting: `&tool=my_app&email=user@domain.com`

### PubMed API Usage Examples

#### 1. Basic article fetch

```bash
curl "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=32589146&retmode=xml"
```

#### 2. Complex search with filters

```python
# Find clinical trials about breast cancer from 2020-2023
params = {
    'db': 'pubmed',
    'term': 'breast cancer AND clinical trial[ptyp]',
    'mindate': '2020',
    'maxdate': '2023',
    'retmax': 50
}
```

#### 3. Convert PMIDs to PMCIDs

```python
elink_url = f"{base_url}elink.fcgi?dbfrom=pubmed&db=pmc&id=32589146,33178922"
```

### PubMed API Best Practices

- Cache frequently accessed data locally
- Use JSON format for easier parsing (`&retmode=json`)
- Stay under 10 requests/sec with API key
- Validate parameters by testing queries in web PubMed first
- Implement retries for HTTP 429/503 errors

### Common Pitfalls (PubMed API)

1. The 2022 update changed some XML tags
2. Pagination errors when using `retstart` without `retmax`
3. Default result limit is 20, use `retmax=1000` for more
4. Date format requires `YYYY/MM/DD` format
5. Never commit API keys to public repositories

### PubMed API Documentation

- [E-utilities Base URL](https://eutils.ncbi.nlm.nih.gov/entrez/eutils/)
- [Complete API Reference](https://www.ncbi.nlm.nih.gov/books/NBK25497/)
- [PubMed Search Field Guide](https://www.ncbi.nlm.nih.gov/books/NBK3827/)
- [Updated 2022 Implementation Details](https://www.ncbi.nlm.nih.gov/books/NBK55449/)

## Integration Architecture

Based on the research so far, here's a proposed architecture for integrating Grok-3-Mini with the FDA Drug Label API and PubMed API:

### Backend Implementation

1. Create a Next.js API route that:
   - Authenticates with Grok-3-Mini using cookie authentication
   - Implements function calling wrappers for FDA Drug Label API and PubMed API
   - Manages API rate limits and error handling

2. Implement the FDA Drug Label API wrapper function:
   - Accept drug name or other search parameters
   - Construct appropriate OpenFDA API requests
   - Process and format the response for readability

3. Implement the PubMed API wrapper function:
   - Accept search terms, date filters, etc.
   - Execute appropriate E-utilities requests
   - Process and format the citation data

### Frontend Implementation

1. Create a chat interface component in the care plan template:
   - Message display area
   - Input field with submission button
   - Loading indicators for in-progress requests

2. Implement care plan context injection:
   - Pass care plan data to the system prompt
   - Structure as JSON or descriptive text

3. Add UI elements for result display:
   - Drug information cards
   - Citation lists with links to PubMed
   - Integration with existing care plan interface

### Next Steps

Additional research needed:

1. Official X.AI documentation for Grok-3-Mini API and tool calling
2. Authentication methods that don't require cookie extraction
3. Specific JSON schema requirements for function calling

After browser-based research, this document will be updated with official documentation findings.
