<?php
/**
 * Marketly AI Shop - UNAS API Proxy
 * Biztonságos proxy az UNAS API és a frontend között
 */

// CORS headers
header('Access-Control-Allow-Origin: https://www.marketly.hu');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// UNAS API Configuration
define('UNAS_API_KEY', '9a6522bfbcd56045cda463a90d7476d932338f52');
define('UNAS_API_URL', 'https://api.unas.eu/shop');

/**
 * Login to UNAS and get Bearer Token
 */
function getUnasToken() {
    $loginXml = '<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <ApiKey>' . UNAS_API_KEY . '</ApiKey>
</Params>';

    $ch = curl_init(UNAS_API_URL . '/login');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $loginXml);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/xml; charset=UTF-8'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception('UNAS Login failed: ' . $httpCode);
    }

    // Parse XML
    $xml = simplexml_load_string($response);
    if ($xml === false) {
        throw new Exception('Failed to parse UNAS login response');
    }

    // Check for errors
    if (isset($xml->Error)) {
        throw new Exception('UNAS API Error: ' . (string)$xml->Error);
    }

    // Extract token
    $token = (string)($xml->Token ?? $xml->Login->Token ?? null);
    if (empty($token)) {
        throw new Exception('No token received from UNAS');
    }

    return $token;
}

/**
 * Fetch products from UNAS
 */
function getProducts($token, $options = []) {
    $limit = isset($options['limit']) ? (int)$options['limit'] : 100;
    $offset = isset($options['offset']) ? (int)$options['offset'] : 0;
    $category = isset($options['category']) ? $options['category'] : null;
    $search = isset($options['search']) ? $options['search'] : null;

    // Build XML request
    $xmlRequest = '<?xml version="1.0" encoding="UTF-8"?>
<Products>
    <Product>
        <Action>query</Action>
        <Lang>hu</Lang>
        <Limit>' . $limit . '</Limit>
        <Offset>' . $offset . '</Offset>';

    if ($category) {
        $xmlRequest .= '<Category><Name>' . htmlspecialchars($category) . '</Name></Category>';
    }

    if ($search) {
        $xmlRequest .= '<Search>' . htmlspecialchars($search) . '</Search>';
    }

    $xmlRequest .= '
    </Product>
</Products>';

    $ch = curl_init(UNAS_API_URL . '/getProduct');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlRequest);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/xml; charset=UTF-8',
        'Authorization: Bearer ' . $token
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception('UNAS getProduct failed: ' . $httpCode);
    }

    return parseProducts($response);
}

/**
 * Parse UNAS XML response to JSON
 */
function parseProducts($xmlString) {
    $xml = simplexml_load_string($xmlString);
    if ($xml === false) {
        throw new Exception('Failed to parse UNAS products response');
    }

    if (isset($xml->Error)) {
        throw new Exception('UNAS API Error: ' . (string)$xml->Error);
    }

    $products = [];
    $productNodes = $xml->Products->Product ?? [];

    // Handle single product (not array)
    if (!is_array($productNodes) && isset($productNodes->Sku)) {
        $productNodes = [$productNodes];
    }

    foreach ($productNodes as $product) {
        $images = [];
        if (isset($product->Images->Image)) {
            $imageNodes = is_array($product->Images->Image) 
                ? $product->Images->Image 
                : [$product->Images->Image];
            
            foreach ($imageNodes as $img) {
                $images[] = [
                    'url' => (string)$img->Url,
                    'alt' => (string)($img->Alt ?? $product->Name)
                ];
            }
        }

        $products[] = [
            'id' => (string)$product->Id,
            'sku' => (string)$product->Sku,
            'name' => (string)$product->Name,
            'description' => (string)($product->Description ?? ''),
            'price' => (float)($product->Prices->Price->Gross ?? 0),
            'currency' => (string)($product->Prices->Price->Currency ?? 'HUF'),
            'category' => (string)($product->Category->Name ?? ''),
            'manufacturer' => (string)($product->Manufacturer ?? ''),
            'stock' => (int)($product->Stock ?? 0),
            'images' => $images,
            'url' => 'https://www.marketly.hu/termek/' . (string)$product->Sku
        ];
    }

    return [
        'products' => $products,
        'total' => count($products),
        'count' => count($products)
    ];
}

// ==================== MAIN ====================

try {
    $action = $_GET['action'] ?? 'products';

    switch ($action) {
        case 'products':
            // Get query parameters
            $params = [
                'limit' => isset($_GET['limit']) ? (int)$_GET['limit'] : 100,
                'offset' => isset($_GET['offset']) ? (int)$_GET['offset'] : 0,
                'category' => $_GET['category'] ?? null,
                'search' => $_GET['search'] ?? null
            ];

            // Get token
            $token = getUnasToken();

            // Fetch products
            $result = getProducts($token, $params);

            // Return JSON
            echo json_encode($result);
            break;

        case 'health':
            echo json_encode([
                'status' => 'ok',
                'timestamp' => date('c')
            ]);
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'error' => 'Invalid action',
                'message' => 'Supported actions: products, health'
            ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}
?>
